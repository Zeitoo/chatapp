// hooks/useSendMessage.ts
import { useUser } from "../useUser";

export function useSendMessage() {
	const { user } = useUser();
	const host = import.meta.env.VITE_API_URL;

	const sendMessage = (chatId: string | undefined, content: string) => {
		if (!chatId || !user?.id) return Promise.reject("Dados insuficientes");

		return fetch(`${host}/new_msg`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				conteudo: content,
				userId: user.id,
				chatId,
			}),
		})
			.then((res) => res.text())
			.then((data) => {
				console.log(data);
				return data;
			});
	};

	return { sendMessage };
}
