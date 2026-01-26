import { Request, Response } from "express";
import {
	getRefreshToken,
	getUsersByEmail,
	putRefreshToken,
	putUser,
} from "../models/models";
import { comparePassword, hashPassword } from "../utils/crypto";
import { generatAccessToken, generateRefreshToken } from "../utils/token";
import crypto from "crypto";

export class AuthController {
	static async login(req: Request, res: Response) {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: "Dados insuficientes." });
		}

		const users = await getUsersByEmail(email);
		if (!users || users.length === 0) {
			return res.status(401).json({ message: "Credenciais inválidas." });
		}

		const user = users[0];
		console.log(user);
		// Verifica se o usuário tem password_hash e se a senha está correta
		if (
			!user.password_hash ||
			!comparePassword(password, user.password_hash)
		) {
			return res.status(401).json({ message: "Credenciais inválidas." });
		}

		// Remove hash da senha da resposta
		delete user.password_hash;

		// Gera refresh token
		const refreshToken = generateRefreshToken();

		const refreshTokenHash = crypto
			.createHash("sha256")
			.update(refreshToken)
			.digest("hex");

		if (!user.id || !user.user_name) return;

		const response = await putRefreshToken(refreshTokenHash, user.id);
		if (!response) return;

		const id = user.id;
		const user_name = user.user_name;

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
			secure: false,
		});

		return res.status(200).json({
			message: "Login feito com sucesso.",
			access_token: generatAccessToken({ id, user_name }),
			user,
		});
	}

	static async signup(req: Request, res: Response) {
		const user = req.body;

		if (!user.userName || !user.emailAddress || !user.password) return;

		// Hash da senha antes de armazenar
		user.password_hash = hashPassword(user.password);

		const estado = await putUser(user);

		if (estado) {
			return res.status(201).json({ message: "signup successful" });
		}

		return res.status(409).json({ message: "user already exists" });
	}

	static async refresh(req: Request, res: Response) {
		const refresh_token = req.cookies.refresh_token;
		if (!refresh_token)
			return res
				.status(401)
				.json({ message: "Refresh token em falta..." });

		const response = await getRefreshToken(refresh_token);
		if (
			!response //|| response.revoke
		) {
			return res.status(400).json({
				message:
					"Refresh token invalido ou revogado, faca a sessao novamente.",
			});
		}

		const user = {
			id: response.user_id,
			user_name: response.user_name,
			profile_img: response.profile_img,
			email_address: response.email_address,
		};

		const refreshToken = generateRefreshToken();

		const refreshTokenHash = crypto
			.createHash("sha256")
			.update(refreshToken)
			.digest("hex");

		if (!user.id || !user.user_name) {
			return res.cookie("refresh_token", refreshToken, {
				httpOnly: true,
				maxAge: 1000 * 6,
				secure: false,
			});
		}

		const resposta = await putRefreshToken(refreshTokenHash, user.id);
		if (!resposta) return;

		res.cookie("refresh_token", refreshToken, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
			secure: false,
		});

		return res.status(200).json({
			message: "Refresh feito com sucesso",
			access_token: generatAccessToken({
				id: user.id,
				user_name: user.user_name,
			}),
			user,
		});
	}
}
