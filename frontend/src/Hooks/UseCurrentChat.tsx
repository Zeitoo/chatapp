// hooks/useCurrentChat.ts
import { useEffect, useState } from "react";
import type { Chat } from "../Types";

export function useCurrentChat(chatId: string | undefined, chats: Chat[]) {
	const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined);

	useEffect(() => {
		if (!chats || !chatId) return;
		const foundChat = chats.find((chat) => chat.id === chatId);
		setCurrentChat(foundChat);
	}, [chatId, chats]);

	return { currentChat, setCurrentChat };
}
