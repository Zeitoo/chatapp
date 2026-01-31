import http from "http";
import { createApp } from "./app";
import { setupWebSocket } from "./websocket/server";
import { config } from "./config/env";

export function startServer() {
	const app = createApp();

	const server = http.createServer(app);

	setupWebSocket(server);

	server.listen(config.port, () => {
		console.log(`
      ========================================
      Servidor inicializado com sucesso!
      
      Modo: ${process.env.NODE_ENV || "development"}
      HTTP: http://localhost:${config.port}
      WebSocket: wss://localhost:${config.port}
      ========================================
    `);
	});

	server.on("error", (error: NodeJS.ErrnoException) => {
		if (error.code === "EADDRINUSE") {
			console.error(`Porta ${config.port} já está em uso!`);
			process.exit(1);
		} else {
			console.error("Erro no servidor:", error);
		}
	});

	const shutdown = () => {
		console.log("\nEncerrando servidor...");
		server.close(() => {
			console.log("Servidor encerrado com sucesso.");
			process.exit(0);
		});

		setTimeout(() => {
			console.error("Servidor forçado a encerrar devido a timeout.");
			process.exit(1);
		}, 2000);
	};

	process.on("SIGTERM", shutdown);
	process.on("SIGINT", shutdown);

	return server;
}
