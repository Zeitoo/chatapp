import { Request, Response } from "express";
import { enrichChatsWithData } from "../utils/chat.helpers";
import {
	putNewChat,
	deletePedido,
	getPedido,
	getPrivateChatBetweenUsers,
} from "../models/models";
import { generateId } from "../utils/token";

interface AuthRequest extends Request {
	user?: {
		id: number;
		user_name: string;
	};
}

export class ChatController {
	static async getChats(
		req: AuthRequest,
		res: Response
	): Promise<Response | undefined> {
		const user = req.user;
		if (user) {
			const chatsWithMsgs = await enrichChatsWithData(user.id);
			return res.status(200).json(chatsWithMsgs);
		}
	}

	static async newChat(req: AuthRequest, res: Response) {
		const user = req.user;
		const users: number[] = req.body.users;

		if (!user || !Array.isArray(users)) {
			return res.status(400).json({ message: "Dados inválidos" });
		}

		if (!users.includes(user.id)) {
			return res.status(403).json({ message: "Acesso negado" });
		}

		const pedido = users.join(",");

		const pedidoExiste = await getPedido(pedido);
		if (!pedidoExiste) {
			return res.status(404).json({ message: "Pedido não encontrado" });
		}

		const chatExiste = await getPrivateChatBetweenUsers(users[0], users[1]);

		if (chatExiste) {
			return res.status(409).json({ message: "Chat já existe" });
		}

		const criado = await putNewChat(generateId(), users);
		if (!criado) {
			return res.status(500).json({ message: "Erro ao criar chat" });
		}

		await deletePedido(pedido);

		return res.status(201).json({
			message: "Chat criado com sucesso",
		});
	}
}
