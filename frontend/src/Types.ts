// Types.ts
export interface User {
	id: number;
	user_name: string;
	email_address: string;
	profile_img: number;
	created_at: string;
	pedidos?: string[];
}

export interface Chat {
	id: string;
	tipo: "grupo" | "individual";
	criado_em: string;
	chat_name: string;
	profile_img: number;
	msgs: Msg[];
	lastUser?: number | null;
	participants: User[];
}

export interface Msg {
	id: number;
	chat_id: string;
	user_id: number;
	conteudo: string;
	enviado_em: string;
}

export interface ChatContextType {
	chats: Chat[];
	openedChat: string | null;
	setOpenedChats: React.Dispatch<React.SetStateAction<string | null>>;
}