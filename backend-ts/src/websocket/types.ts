import WebSocket from "ws";

// Define tipos para o sistema WebSocket

export interface WebSocketUser {
	userId: string;
	socket: WebSocket;
}

export interface Chat {
	id: string;
	tipo: string;
	criado_em: string;
	chat_name: string;
	profile_img: number;
	participants: any[]; // Usar tipo mais específico se possível
}

export interface WebSocketMessage {
	titulo: string;
	body: {
		content: string;
		chat: Chat;
	};
	access_token: string;
}

export interface AuthenticatedSocket extends WebSocket {
	userId?: number;
}
