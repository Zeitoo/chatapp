// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

interface JwtPayloadWithId extends jwt.JwtPayload {
	id: number;
	user_name: string;
}

interface AuthRequest extends Request {
	user?: {
		id: number;
		user_name: string;
	};
}

export async function verifyAuth(
	req: AuthRequest,
	res: Response,
	next: NextFunction
) {
	const authorization =
		req.headers["authorization"] ?? req.headers.authorization;
	const access_token =
		typeof authorization === "string"
			? authorization.split(" ")[1]
			: undefined;

	console.log(req.headers);
	if (!access_token || !process.env.AUTHORIZATION_SECRET) {
		return res.status(401).json({ message: "Credenciais ausentes." });
	}
	console.log(access_token,`
		
		`, 1)

	try {
		console.log(2)
		const data = jwt.verify(
			access_token,
			process.env.AUTHORIZATION_SECRET
		) as JwtPayloadWithId;

		if (!data || !data.id) {
			return res
				.status(403)
				.json({ message: "Token inválido ou payload incompleto." });
		}

		console.log("verificado:   /", data);
		req.user = data;

		return next();
	} catch (err) {
		// usa explicitamente 'err' aqui — bom para logs / respostas mais informativas
		if (err instanceof TokenExpiredError) {
			return res.status(401).json({ message: "Access token expirado." });
		}
		if (err instanceof JsonWebTokenError) {
			return res.status(403).json({
				message: "Falha na verificação do token.",
				details: err.message,
			});
		}
		console.error("Erro ao verificar JWT:", err);
		return res
			.status(500)
			.json({ message: "Erro interno ao verificar token." });
	}
}
