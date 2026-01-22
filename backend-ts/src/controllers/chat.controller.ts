import { Request, Response } from "express";
import { enrichChatsWithData } from "../utils/chat.helpers";
import {
	putMessage,
	putNewChat,
	deletePedido,
	getPedidos,
	getUsersIdByToken,
	getPedido,
	getPrivateChatBetweenUsers,
} from "../models/models";
import { generateId } from "../utils/token";

export class ChatController {
	static async getChats(req: Request, res: Response) {
		const accessToken = req.cookies?.access_token as string;

		if (accessToken) {
			const { user_id } = await getUsersIdByToken(accessToken);

			if (user_id) {
				const chatsWithMsgs = await enrichChatsWithData(user_id);
				return res.status(200).json(chatsWithMsgs);
			}

			return res.json({ message: "failed" });
		}
	}

	static async newMessage(req: Request, res: Response) {
		const { chatId, conteudo, userId } = req.body;

		await putMessage({ chatId, conteudo, userId });
		return res.status(200).send("done");
	}

	static async newChat(req: Request, res: Response) {
		const accessToken = req.cookies?.access_token as string;
		const users: number[] = req.body.users;
		const { user_id } = await getUsersIdByToken(accessToken);
		if (!users.includes(user_id)) return;
		const pedido = users.join(",");

		const answer = await getPedido(pedido);
		if (!answer) return;
		const chatAllreadyExixts = await getPrivateChatBetweenUsers(
			users[0],
			users[1]
		);

		if (chatAllreadyExixts) return;

		const response = await putNewChat(generateId(), users);

		if (!response) {
			return res.status(400).json({
				message: "Houve um erro na criacao do chat...",
			});
		}

		const deleted = await deletePedido(pedido);

		if (deleted) {
			return res.status(200).json({
				message: "Chat criado com sucesso",
			});
		}

		return res.status(400).json({
			message: "Houve um erro na criacao do chat...",
		});
	}
}
