import WebSocket from "ws";
import { AuthenticatedSocket, WebSocketMessage, WebSocketUser } from "./types";
import { putMessage } from "../models/models";

const users = new Map<string, WebSocketUser>();

export async function handleWebSocketConnection(
	ws: AuthenticatedSocket,
	req: any
) {
	console.log("Novo usuário conectado via WebSocket...");

	const params = new URLSearchParams(req.url?.split("?")[1]);
	const userId = params.get("userId");

	if (!userId) {
		console.log("Conexão WebSocket recusada: userId não fornecido");
		return;
	}

	users.set(userId, { userId, socket: ws });

	ws.on("message", async (message: Buffer) => {
		try {
			const data: WebSocketMessage = JSON.parse(message.toString());

			switch (data.titulo) {
				case "newMsg":
					await handleNewMessage(data, userId, ws);
					break;
			}
		} catch (error) {
			console.error("Erro ao processar mensagem WebSocket:", error);
		}
	});

	ws.on("close", () => {
		console.log(`Usuário ${userId} desconectado do WebSocket`);
		users.delete(userId);
	});

	ws.on("error", (error) => {
		console.error(`Erro no WebSocket do usuário ${userId}:`, error);
		users.delete(userId);
	});
}

async function handleNewMessage(
	data: WebSocketMessage,
	senderUserId: string,
	senderWs: WebSocket
) {
	const conteudo = data.body.content;
	const chatId = data.body.chat.id;
	const participants = data.body.chat.participants;
	const enviado_em = new Date().toISOString();

	const response = await putMessage({
		chatId,
		userId: senderUserId,
		conteudo,
	});

	if (!response?.affectedRows) {
		console.error("Falha ao salvar mensagem no banco de dados");
		return;
	}

	const targets: WebSocketUser[] = [];

	participants.forEach((participant: any) => {
		const userIdStr = String(participant.id);
		const target = users.get(userIdStr);
		if (target) {
			targets.push(target);
		}
	});

	for (const target of targets) {
		try {
			target.socket.send(
				JSON.stringify({
					titulo: "newMsg",
					conteudo,
					chat_id: chatId,
					user_id: Number(senderUserId),
					enviado_em,
				})
			);
		} catch (error) {
			console.error(
				`Erro ao enviar mensagem para usuário ${target.userId}:`,
				error
			);
		}
	}

	senderWs.send(
		JSON.stringify({
			titulo: "messageSent",
			chat_id: chatId,
			enviado_em,
		})
	);
}
