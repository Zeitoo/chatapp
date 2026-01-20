// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { getAccessToken } from '../models/models';

export async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const ip = req.socket.remoteAddress?.replace(/[:.]/g, '').replace('ffff', '') ?? '';
  const accessToken = req.cookies?.access_token as string | undefined;

  if (!accessToken) {
    return res.status(401).json({ message: 'Login required...' });
  }

  try {
    const tokenData = await getAccessToken(accessToken);

    if (tokenData.length > 0 && tokenData[0].token.split('ty')[1] === ip) {
      return next();
    }
  } catch (err) {
    console.error('Erro na verificação de autenticação:', err);
  }

  res.cookie('access_token', '', {
    httpOnly: true,
    maxAge: 1000 * 2,
    secure: false,
  });

  return res.status(401).json({ message: 'Login required...' });
}