import { Request } from "express";

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

export interface User {
  id: number;
  user_name: string;
  email: string;
  profile_img?: string;
  criado_em: string;
  password_hash?: string;
}

export interface Chat {
  id: string;
  tipo: "privado" | "grupo";
  criado_em: string;
  chat_name?: string;
  profile_img?: number;
  participants?: User[];
  msgs?: Message[];
}

export interface Message {
  id: number;
  chat_id: string;
  user_id: number;
  conteudo: string;
  enviado_em: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}