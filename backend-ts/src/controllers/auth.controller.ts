import { Request, Response } from "express";
import { getUsersByEmail, putAccessToken, putUser } from "../models/models";
import { comparePassword, hashPassword } from "../utils/crypto";
import { generateToken } from "../utils/token";

export class AuthController {
	static async login(req: Request, res: Response) {
		const ip = req.socket.remoteAddress ?? "";
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "Dados insuficientes." });
		}

		const users = await getUsersByEmail(email);
		if (!users || users.length === 0) {
			return res.status(401).json({ message: "Credenciais inválidas." });
		}

		const user = users[0];

		// Verifica se o usuário tem password_hash e se a senha está correta
		if (
			!user.password_hash ||
			!comparePassword(password, user.password_hash)
		) {
			return res.status(401).json({ message: "Credenciais inválidas." });
		}

		// Remove hash da senha da resposta
		delete user.password_hash;

		// Gera token de acesso
		const accessToken = generateToken(ip);

		// Verifica se o usuário tem ID
		if (!user.id) {
			return res
				.status(500)
				.json({ message: "Erro interno do servidor." });
		}

		await putAccessToken(accessToken, user.id);

		res.cookie("access_token", accessToken, {
			httpOnly: true,
			maxAge: 1000 * 60 * 600,
			secure: false,
		});

		return res.status(200).json({
			message: "Login feito com sucesso.",
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
}
