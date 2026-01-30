// hooks/useRequests.ts
import { useState, useCallback } from "react";
import type { User } from "../Types";
import { useUser } from "./useUser";
import { api } from "../auth/api";

const host = import.meta.env.VITE_API_URL;

export function useRequests() {
	const { user, setUser } = useUser();
	const [recebidos, setRecebidos] = useState<User[] | null>(null);
	const [enviados, setEnviados] = useState<User[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const deletFetch = useCallback(async (pedido: string): Promise<boolean> => {
		try {
			const response = await api.delete(`${host}/api/pedidos/`, {
				data: { pedido },
			});
			return response.statusText === "OK";
		} catch (error) {
			console.error("Erro ao deletar pedido:", error);
			return false;
		}
	}, []);

	const putChatFetch = useCallback(
		async (userId: number): Promise<boolean> => {
			try {
				const response = await api.put(
					`${host}/api/chats/new_chat`,
					JSON.stringify({
						users: [userId, user?.id],
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
		[user?.id]
	);

	const fetchUsers = useCallback(
		async (userIds: string[]): Promise<User[]> => {
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
		[]
	);

	// ⭐ CORRIJA: Atualize o estado do usuário localmente
	const updateUserPedidos = useCallback(
		(userId: number, isRecebido: boolean) => {
			isRecebido;
			if (!user?.pedidos) return;

			// Remova o pedido da lista local
			const pedidos = user.pedidos.filter(
				(element) => !element.includes(String(userId))
			);

			setUser({
				...user,
				pedidos,
			});
		},
		[user, setUser]
	);

	const clearRequests = useCallback(() => {
		setRecebidos(null);
		setEnviados(null);
	}, []);

	const loadRequests = useCallback(async () => {
		if (!user?.pedidos) {
			setRecebidos([]);
			setEnviados([]);
			return;
		}

		setIsLoading(true);

		const recebidosArray: string[] = [];
		const enviadosArray: string[] = [];

		user.pedidos.forEach((c) => {
			const id1 = c[0];
			const id2 = c[1];
			if (Number(id1) === user.id) {
				enviadosArray.push(id2);
			} else {
				recebidosArray.push(id1);
			}
		});

		try {
			// Busque ambos em paralelo
			const [recebidosData, enviadosData] = await Promise.all([
				recebidosArray.length > 0
					? fetchUsers(recebidosArray)
					: Promise.resolve([]),
				enviadosArray.length > 0
					? fetchUsers(enviadosArray)
					: Promise.resolve([]),
			]);

			// ⭐ CORRIJA: Verifique se os dados são arrays válidos
			setRecebidos(Array.isArray(recebidosData) ? recebidosData : []);
			setEnviados(Array.isArray(enviadosData) ? enviadosData : []);
		} catch (error) {
			console.error("Erro ao carregar pedidos:", error);
			setRecebidos([]);
			setEnviados([]);
		} finally {
			setIsLoading(false);
		}
	}, [user, fetchUsers]);

	// ⭐ CORRIJA: Funções de ação sincronizadas
	const rejeitarPedido = useCallback(
		async (userId: number) => {
			const pedido = `${userId},${user?.id}`;
			const success = await deletFetch(pedido);

			if (success) {
				// Atualize localmente
				updateUserPedidos(userId, true);
				setRecebidos((prev) =>
					prev ? prev.filter((u) => u.id !== userId) : []
				);
			}

			return success;
		},
		[deletFetch, user?.id, updateUserPedidos]
	);

	const aceitarPedido = useCallback(
		async (userId: number) => {
			const success = await putChatFetch(userId);

			if (success) {
				// Primeiro remova o pedido
				const deleteSuccess = await deletFetch(`${userId},${user?.id}`);
				if (deleteSuccess) {
					// Atualize localmente
					updateUserPedidos(userId, true);
					setRecebidos((prev) =>
						prev ? prev.filter((u) => u.id !== userId) : []
					);
				}
			}

			return success;
		},
		[putChatFetch, deletFetch, user?.id, updateUserPedidos]
	);

	const cancelarPedido = useCallback(
		async (userId: number) => {
			const pedido = `${user?.id},${userId}`;
			const success = await deletFetch(pedido);

			if (success) {
				// Atualize localmente
				updateUserPedidos(userId, false);
				setEnviados((prev) =>
					prev ? prev.filter((u) => u.id !== userId) : []
				);
			}

			return success;
		},
		[deletFetch, user?.id, updateUserPedidos]
	);

	return {
		recebidos,
		enviados,
		isLoading,
		rejeitarPedido,
		aceitarPedido,
		cancelarPedido,
		loadRequests,
		clearRequests,
	};
}
