import dotenv from "dotenv";

dotenv.config();

/**
 * Ponto de entrada principal da aplicação
 * Inicializa o servidor e trata exceções não capturadas
 */

// Captura exceções não tratadas
process.on("uncaughtException", (error) => {
	console.error("Exceção não tratada:", error);
	process.exit(1);
});

// Captura rejeições de promises não tratadas
process.on("unhandledRejection", (reason, promise) => {
	console.error("Promise rejeitada não tratada:", reason);
	console.error("Promise:", promise);
});

// Importa e inicia o servidor
import { startServer } from "./server";

// Inicializa o servidor
startServer();
