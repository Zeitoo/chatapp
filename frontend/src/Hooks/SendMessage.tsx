// hooks/useSendMessage.ts
import { useUser } from "./useUser";
import type { Chat } from "../Types";
import { useAuth } from "../Contexts/AuthContext";
export function useSendMessage() {
	const { ws, user } = useUser();
	const { getAccessToken } = useAuth();
	const sendMessage = (chat: Chat | undefined, content: string) => {
		if (!chat || !user?.id) return Promise.reject("Dados insuficientes");

		if (chat.tipo == "privado") {
			if (typeof user.id !== "undefined") {
				chat.participants.push(user);
			}
		}

		ws.current?.send(
			JSON.stringify({
				titulo: "newMsg",
				body: {
					content,
					chat,
					userId: user.id,
				},
				access_token: getAccessToken(),
			})
		);
	};

	return { sendMessage };
}
