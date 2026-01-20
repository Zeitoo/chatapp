import {
	getChats,
	getChatMessages,
	getChatParticipants,
	getUser,
} from "../models/models";

/**
 * Enriquece os chats com mensagens e participantes.
 * @param userId - ID do usuário
 * @returns Lista de chats com dados completos
 */
export async function enrichChatsWithData(userId: number) {
	const chats = await getChats(userId);

	await Promise.all(
		chats.map(async (chat: any) => {
			const [msgs, participants] = await Promise.all([
				getChatMessages(chat.id),
				getChatParticipants(chat.id),
			]);

			chat.msgs = msgs;

			if (chat.tipo === "privado") {
				const otherUser = participants.find(
					(u: any) => u.user_id !== userId
				);

				if (!otherUser) return;

				const userData = await getUser(otherUser.user_id);
				const user = userData[0];
				if (!user) return;

				chat.chat_name = user.user_name;
				chat.profile_img = user.profile_img;
				chat.participants = [user];
				return;
			}

			const participantsData = await Promise.all(
				participants.map(async (p: any) => {
					const userData = await getUser(p.user_id);
					const user = userData[0];
					if (!user) return null;
					delete user.password_hash;
					return user;
				})
			);

			chat.participants = participantsData.filter(Boolean);
		})
	);

	return chats;
}
