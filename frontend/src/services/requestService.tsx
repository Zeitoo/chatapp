import { api } from "../auth/api";
import type { User } from "../Types";

const host = import.meta.env.VITE_API_URL;

export const requestService = {
	async deleteRequest(pedido: string): Promise<boolean> {
		try {
			const response = await api.delete(`${host}/api/pedidos/`, {
				data: { pedido },
			});
			return response.statusText === "OK";
		} catch (error) {
			console.error("Erro ao deletar pedido:", error);
			return false;
		}
	},

	async createChat(userId: number, currentUserId: number): Promise<boolean> {
		try {
			const response = await api.put(
				`${host}/api/chats/new_chat`,
				JSON.stringify({
					users: [userId, currentUserId],
				}),
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			return response.statusText === "OK";
		} catch (error) {
			console.error("Erro ao criar chat:", error);
			return false;
		}
	},

	async fetchUsers(userIds: string[]): Promise<User[]> {
		try {
			const response = await api.post<User[]>(`${host}/api/users`, {
				users: userIds,
			});
			return response.data;
		} catch (error) {
			console.error("Erro ao buscar usuários:", error);
			return [];
		}
	},

	async createRequest(pedido: string): Promise<boolean> {
		try {
			const response = await api.put(
				`${host}/api/pedidos`,
				JSON.stringify({ pedido }),
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			return response.statusText === "OK";
		} catch (error) {
			console.error("Erro ao criar pedido:", error);
			return false;
		}
	},
};
