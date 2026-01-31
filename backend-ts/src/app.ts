import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/cors";
import routes from "./routes";
import { Request, Response } from "express";
import rateLimit from "express-rate-limit";

// Configuração do rate limiter
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 100, // 100 requisições por IP
	standardHeaders: true, // informa limites no cabeçalho
	legacyHeaders: false, // desativa cabeçalhos antigos
	message: "Você excedeu o número de requisições, tente mais tarde.",
});

export function createApp() {
	const app = express();

	app.use(express.json());
	app.use(limiter);
	app.use(cors(corsOptions));
	app.use(cookieParser());

	app.use("/api", routes);

	app.get("/", (req, res) => {
		res.json({
			status: "online",
			message: "API funcionando",
			timestamp: new Date().toISOString(),
		});
	});

	app.use((req: Request, res: Response) => {
		res.status(404).json({ message: "Rota não encontrada" });
	});

	app.use((error: any, _req: any, res: any, _next: any) => {
		console.error("Erro não tratado:", error);
		res.status(500).json({
			message: "Erro interno do servidor",
			error:
				process.env.NODE_ENV === "development"
					? error.message
					: undefined,
		});
	});

	return app;
}
