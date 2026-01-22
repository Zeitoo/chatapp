// hooks/useRequests.ts
import { useState, useCallback } from "react";
import type { User } from "../Types";
import { useUser } from "./useUser";

const host = import.meta.env.VITE_API_URL;

export function useRequests() {
	const { user, setUser } = useUser();
	const [recebidos, setRecebidos] = useState<User[] | null>(null);
	const [enviados, setEnviados] = useState<User[] | null>(null);

	const deletFetch = useCallback(async (pedido: string): Promise<boolean> => {
		try {
			const response = await fetch(`${host}/api/pedidos/`, {
				method: "DELETE",
				body: JSON.stringify({ pedido }),
				headers: { "Content-Type": "application/json" },
			});
			return response.ok;
		} catch (error) {
			console.error("Erro ao deletar pedido:", error);
			return false;
		}
	}, []);

	const putChatFetch = useCallback(
		async (userId: number): Promise<boolean> => {
			try {
				const response = await fetch(`${host}/api/chats/new_chat`, {
					method: "PUT",
					body: JSON.stringify({
						users: [userId, user?.id],
					}),
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				});

				return response.ok;
			} catch (error) {
				console.error("Erro ao criar chat:", error);
				return false;
			}
		},
		[user?.id]
	);

	const fetchUsers = useCallback(
		async (userIds: string[]): Promise<User[] | { message: string }> => {
			try {
				const response = await fetch(`${host}/api/users/`, {
					method: "POST",
					body: JSON.stringify({ users: userIds }),
					headers: { "Content-Type": "application/json" },
				});
				return await response.json();
			} catch (error) {
				console.error("Erro ao buscar usuários:", error);
				return [];
			}
		},
		[]
	);

	const updateUserPedidos = useCallback(
		(userId: number, isRecebido: boolean) => {
			isRecebido;
			if (!user?.pedidos) return;

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

	const rejeitarPedido = useCallback(
		async (userId: number) => {
			const pedido = `${userId},${user?.id}`;
			const success = await deletFetch(pedido);

			if (success) {
				updateUserPedidos(userId, true);
				setRecebidos(
					(prev) => prev?.filter((u) => u.id !== userId) || null
				);
			}
		},
		[deletFetch, user?.id, updateUserPedidos]
	);

	const aceitarPedido = useCallback(
		async (userId: number) => {
			const success = await putChatFetch(userId);

			if (success) {
				updateUserPedidos(userId, true);
				setRecebidos(
					(prev) => prev?.filter((u) => u.id !== userId) || null
				);
			}
		},
		[putChatFetch, updateUserPedidos]
	);

	const cancelarPedido = useCallback(
		async (userId: number) => {
			const pedido = `${user?.id},${userId}`;
			const success = await deletFetch(pedido);

			if (success) {
				updateUserPedidos(userId, false);
				setEnviados(
					(prev) => prev?.filter((u) => u.id !== userId) || null
				);
			}
		},
		[deletFetch, user?.id, updateUserPedidos]
	);

	const loadRequests = useCallback(async () => {
		if (!user?.pedidos) return;

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

		if (enviadosArray.length > 0) {
			const data = await fetchUsers(enviadosArray);

			if ("message" in data) {
				return;
			}

			setEnviados(data);
		}

		if (recebidosArray.length > 0) {
			const data = await fetchUsers(recebidosArray);

			if ("message" in data) {
				return;
			}
			setRecebidos(data);
		}
	}, [user, fetchUsers]);

	return {
		recebidos,
		enviados,
		rejeitarPedido,
		aceitarPedido,
		cancelarPedido,
		loadRequests,
		setRecebidos,
		setEnviados,
	};
}
