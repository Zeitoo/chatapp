// src/controllers/pedido.controller.ts
import { Request, Response } from 'express';
import { deletePedido } from '../models/models';

export class PedidoController {
  static async deletePedido(req: Request, res: Response) {
    const pedido = req.body.pedido;
    const response = await deletePedido(pedido);

    if (response) {
      return res.status(200).json({ message: 'Apagado com sucesso.' });
    }

    return res.status(404).json({ message: 'Pedido não encontrado.' });
  }
}