import WebSocket from "ws";
import { AuthenticatedSocket, WebSocketMessage, WebSocketUser } from "./types";
import { putMessage } from "../models/models";
import jwt from "jsonwebtoken";

const users = new Map<string, WebSocketUser>();

// Rate limiting por usuário
const rateLimits = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_MAX = 10; // 10 mensagens
const RATE_LIMIT_WINDOW = 15 * 1000; // 15 segundos

interface JwtPayloadWithId extends jwt.JwtPayload {
	id: number;
	user_name: string;
}

export async function handleWebSocketConnection(
	ws: AuthenticatedSocket,
	req: any
) {
	console.log("Novo usuário conectado via WebSocket...");

	const params = new URLSearchParams(req.url?.split("?")[1]);
	const userId = params.get("userId");

	if (!userId) return;

	setTimeout(() => {
		if (!users.get(userId)) {
			ws.close();
		}
	}, 10000);

	ws.on("message", async (message: Buffer) => {
		try {
			// Rate limiting
			const now = Date.now();
			const rate = rateLimits.get(userId) || { count: 0, lastReset: now };

			if (now - rate.lastReset > RATE_LIMIT_WINDOW) {
				// Reseta o contador após o período
				rate.count = 0;
				rate.lastReset = now;
			}

			rate.count++;
			rateLimits.set(userId, rate);

			if (rate.count > RATE_LIMIT_MAX) {
				ws.send(
					JSON.stringify({
						titulo: "error",
						message:
							"Você está enviando mensagens rápido demais. Tente novamente mais tarde.",
					})
				);
				return;
			}

			const data: WebSocketMessage = JSON.parse(message.toString());
			const access_token = data.access_token;

			if (!process.env.AUTHORIZATION_SECRET || !access_token) return;

			const dados = jwt.verify(
				access_token,
				process.env.AUTHORIZATION_SECRET
			) as JwtPayloadWithId;

			if (!dados || !dados.id || Number(userId) != dados.id) {
				ws.close();
				users.delete(userId);
				return;
			}

			if (!users.has(String(dados.id))) {
				users.set(String(dados.id), {
					userId: String(dados.id),
					socket: ws,
				});
			}

			switch (data.titulo) {
				case "newMsg":
					await handleNewMessage(data, userId, ws);
					break;
				case "putPedido":
					handlePutPedido(data, String(dados.id), ws);
					break;
				case "delPedido":
					handleDelPedido(data, String(dados.id), ws);
					break;
				case "activate":
					break;
			}
		} catch (error) {
			console.error("Erro ao processar mensagem WebSocket:", error);
		}
	});

	ws.on("close", () => {
		console.log(`Usuário ${userId} desconectado do WebSocket`);
		users.delete(userId);
		rateLimits.delete(userId); // limpa o rate limit
	});

	ws.on("error", (error) => {
		console.error(`Erro no WebSocket do usuário ${userId}:`, error);
		users.delete(userId);
		rateLimits.delete(userId);
	});
}

async function handleNewMessage(
	data: WebSocketMessage,
	senderUserId: string,
	senderWs: WebSocket
) {
	if (
		!data.body ||
		!data.body.chat ||
		!Array.isArray(data.body.chat.participants)
	)
		return;

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
}

async function handlePutPedido(
	data: WebSocketMessage,
	senderUserId: string,
	senderWs: WebSocket
) {
	const destinatarios = data.pedido?.split(",");
	if (!destinatarios) return;

	if (!users.get(destinatarios[1])) return;
	users.get(destinatarios[1])?.socket.send(
		JSON.stringify({
			titulo: "putPedido",
			pedido: data.pedido,
		})
	);
}

async function handleDelPedido(
	data: WebSocketMessage,
	senderUserId: string,
	senderWs: WebSocket
) {
	const destinatarios = data.pedido?.split(",");
	if (!destinatarios) return;

	if (!users.get(destinatarios[1])) return;
	users.get(destinatarios[1])?.socket.send(
		JSON.stringify({
			titulo: "delPedido",
			pedido: data.pedido,
		})
	);
}

// A cada 5 minutos, limpa usuários e rate limits desconectados
setInterval(() => {
	const now = Date.now();

	for (const [userId, user] of users) {
		if (user.socket.readyState === WebSocket.CLOSED) {
			users.delete(userId);
			rateLimits.delete(userId);
		}
	}

	for (const [userId, rate] of rateLimits) {
		// também pode limpar se não houve mensagem por muito tempo
		if (now - rate.lastReset > 60 * 60 * 1000) {
			// 1 hora sem mensagens
			rateLimits.delete(userId);
		}
	}
}, 35 * 60 * 1000); // 5 minutos
