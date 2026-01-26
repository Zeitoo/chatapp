import { createContext } from "react";

interface Msg {
	id: number;
	chat_id: string;
	user_id: number;
	conteudo: string;
	enviado_em: string; // ISO timestamp
}

interface Chat {
	id: string;
	tipo: string; // se souberes os tipos possíveis
	criado_em: string; // ISO timestamp
	chat_name: string;
	profile_img: number;
	msgs: Msg[]; // array de mensagens
}

export interface ChatContextType {
	isChatOpen: boolean;
	setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
	chats: Chat[] | null;
	Chats:  React.RefObject<Chat[] | null>;
	setChats: React.Dispatch<React.SetStateAction<Chat[] | null>>;
}

export const ChatContext = createContext<ChatContextType | null>(null);
