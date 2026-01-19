import { useState, useRef,useEffect } from "react";
import { ChatContext } from "./chatContext";

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
	Chats: React.RefObject<Chat[] | null>;
	setChats: React.Dispatch<React.SetStateAction<Chat[] | null>>;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
	const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
	const [chats, setChats] = useState<Chat[] | null>(null);
	const Chats = useRef(chats);

	useEffect(() => {
		Chats.current = chats;
	}, [chats]);

	return (
		<ChatContext.Provider
			value={{ isChatOpen, setIsChatOpen, chats, Chats, setChats }}>
			{children}
		</ChatContext.Provider>
	);
}
