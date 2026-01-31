// src/controllers/pedido.controller.ts
import { Request, Response } from "express";
import { deletePedido, putPedido, getUsers } from "../models/models";

interface AuthRequest extends Request {
	user?: {
		id: number;
		user_name: string;
	};
}
interface DeletePedidoBody {
	pedido: string;
}

export class PedidoController {
	static async deletePedido(
		req: Request<{}, {}, DeletePedidoBody> & AuthRequest,
		res: Response
	) {
		const { pedido } = req.body;
		const user = req.user;
		if (!user || !pedido)
			return res.status(400).json({ message: "Dados insuficientes" });
		if (!pedido.includes(user?.id))
			return res
				.status(401)
				.json({ message: "User nao autenticado ou pedido invalido" });

		const response = await deletePedido(pedido);

		if (response) {
			return res.status(200).json({ message: "Apagado com sucesso." });
		}

		return res.status(404).json({ message: "Pedido não encontrado." });
	}
	static async putPedidoS(req: AuthRequest, res: Response) {
		const pedido = req.body.pedido;
		const user = req.user;
		const usuarios = pedido.split(",");

		if (!user)
			return res.status(400).json({ message: "User nao autorizado" });

		if (Number(usuarios[0]) != user.id)
			return res
				.status(400)
				.json({
					message: "Actividade suspeita detectada, pedido negado.",
				});

		const users = await getUsers(
			pedido.split(",").map((element: string) => Number(element))
		);
		if (users.length < 2)
			return res.status(400).json({ message: "Users invalidos" });

		const response = await putPedido(usuarios[0], usuarios[1]);

		if (response) {
			res.status(200).json({ message: "Pedido adicionado" });
		} else {
			res.status(401).json({ message: "Pedido ja existente" });
		}
	}
}
