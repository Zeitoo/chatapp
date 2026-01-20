import { Request, Response } from 'express';
import { enrichChatsWithData } from '../utils/chat.helpers';
import { putMessage, putNewChat, deletePedido } from '../models/models';
import { generateId } from '../utils/token';

export class ChatController {
  static async getChats(req: Request, res: Response) {
    const user = req.body;

    if (user?.id) {
      const chatsWithMsgs = await enrichChatsWithData(user.id);
      return res.status(200).json(chatsWithMsgs);
    }

    return res.json({ message: 'failed' });
  }

  static async newMessage(req: Request, res: Response) {
    const { chatId, conteudo, userId } = req.body;

    await putMessage({ chatId, conteudo, userId });
    return res.status(200).send('done');
  }

  static async newChat(req: Request, res: Response) {
    const users: number[] = req.body.users;
    const response = await putNewChat(generateId(), users);

    if (!response) {
      return res.status(400).json({
        message: 'Houve um erro na criacao do chat...',
      });
    }

    const pedido = users.join(',');
    const deleted = await deletePedido(pedido);

    if (deleted) {
      return res.status(200).json({
        message: 'Chat criado com sucesso',
      });
    }

    return res.status(400).json({
      message: 'Houve um erro na criacao do chat...',
    });
  }
}