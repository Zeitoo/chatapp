// chat.helpers.ts
import {
	getChatsByUser,
	getChatUsersByChatIds,
	getMessagesByChatIds,
	getUsersByIds,
} from "../models/models";

export async function enrichChatsWithData(userId: number) {
	// 1. chats do user
	const chats = await getChatsByUser(userId);
	if (!chats.length) return [];

	const chatIds = chats.map((c: any) => c.id);

	// 2. buscar tudo de uma vez
	const [messages, chatUsers] = await Promise.all([
		getMessagesByChatIds(chatIds),
		getChatUsersByChatIds(chatIds),
	]);

	// 3. user_ids únicos
	const userIds = [...new Set(chatUsers.map((cu: any) => cu.user_id))];

	const users = await getUsersByIds(userIds);

	/* ================= MAPS ================= */

	const messagesByChat = new Map<string, any[]>();
	for (const m of messages) {
		const arr = messagesByChat.get(m.chat_id) ?? [];
		arr.push(m);
		messagesByChat.set(m.chat_id, arr);
	}

	const usersById = new Map<number, any>();
	for (const u of users) usersById.set(u.id, u);

	const participantsByChat = new Map<string, any[]>();
	for (const cu of chatUsers) {
		const arr = participantsByChat.get(cu.chat_id) ?? [];
		const user = usersById.get(cu.user_id);
		if (user) arr.push(user);
		participantsByChat.set(cu.chat_id, arr);
	}

	/* ================= ENRICH ================= */

	return chats.map((chat: any) => {
		chat.msgs = messagesByChat.get(chat.id) ?? [];
		chat.participants = participantsByChat.get(chat.id) ?? [];

		if (chat.tipo === "privado") {
			const otherUser = chat.participants.find(
				(u: any) => u.id !== userId
			);

			if (otherUser) {
				chat.chat_name = otherUser.user_name;
				chat.profile_img = otherUser.profile_img ?? null;
				chat.participants = [otherUser];
			}
		}

		return chat;
	});
}
