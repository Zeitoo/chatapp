// src/controllers/pedido.controller.ts
import { Request, Response } from "express";
import { deletePedido, putPedido, getUsers } from "../models/models";

export class PedidoController {
	static async deletePedido(req: Request, res: Response) {
		const pedido = req.body.pedido;
		const response = await deletePedido(pedido);

		if (response) {
			return res.status(200).json({ message: "Apagado com sucesso." });
		}

		return res.status(404).json({ message: "Pedido não encontrado." });
	}

	static async putPedidoS(req: Request, res: Response) {
		const pedido = req.body.pedido;
		const usuarios = pedido.split(",");

		const users = await getUsers(
			pedido.split(",").map((element: string) => Number(element))
		);
		if (users.length < 2) return;

		const response = await putPedido(usuarios[0], usuarios[1]);

		if (response) {
			res.status(200).json({ message: "Pedido adicionado" });
		} else {
			res.status(401).json({ message: "Pedido ja existente" });
		}
	}
}
