import { useState, useCallback } from "react";
import type { User } from "../Types";
import { useUser } from "./useUser";
import { requestService } from "../services/requestService";
import { useAuth } from "../Contexts/AuthContext";

export function useRequests() {
	const { getAccessToken } = useAuth();
	const { user, setUser, ws } = useUser();
	const [recebidos, setRecebidos] = useState<User[] | null>(null);
	const [enviados, setEnviados] = useState<User[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// 🔥 Funções de WebSocket (reutilizáveis)
	const notifyWebSocket = useCallback(
		(titulo: string, pedido: string) => {
			if (ws.current && user?.id) {
				ws.current.send(
					JSON.stringify({
						titulo,
						pedido,
						userId: user.id,
						access_token: getAccessToken(),
					})
				);
			}
		},
		[ws, user?.id, getAccessToken]
	);

	const notifyDelete = useCallback(
		(pedido: string) => notifyWebSocket("delPedido", pedido),
		[notifyWebSocket]
	);

	const notifyCreate = useCallback(
		(pedido: string) => notifyWebSocket("putPedido", pedido),
		[notifyWebSocket]
	);

	// 🔥 Atualização local do usuário (otimizada)
	const updateLocalUser = useCallback(
		(userId: number, isRemoving: boolean = true) => {
			if (!user?.pedidos || !isRemoving) return;

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

	// 🔥 Carregamento de pedidos
	const loadRequests = useCallback(async () => {
		if (!user?.pedidos) {
			setRecebidos([]);
			setEnviados([]);
			return;
		}

		setIsLoading(true);

		const { recebidosIds, enviadosIds } = user.pedidos.reduce(
			(acc, [id1, id2]) => {
				if (Number(id1) === user.id) {
					acc.enviadosIds.push(id2);
				} else {
					acc.recebidosIds.push(id1);
				}
				return acc;
			},
			{ recebidosIds: [] as string[], enviadosIds: [] as string[] }
		);

		try {
			const [recebidosData, enviadosData] = await Promise.all([
				recebidosIds.length > 0
					? requestService.fetchUsers(recebidosIds)
					: [],
				enviadosIds.length > 0
					? requestService.fetchUsers(enviadosIds)
					: [],
			]);

			setRecebidos(recebidosData);
			setEnviados(enviadosData);
		} catch (error) {
			console.error("Erro ao carregar pedidos:", error);
			setRecebidos([]);
			setEnviados([]);
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	// 🔥 Ações de pedidos (compartilháveis)
	const rejeitarPedido = useCallback(
		async (userId: number) => {
			if (!user?.id) return false;

			const pedido = `${userId},${user.id}`;
			const success = await requestService.deleteRequest(pedido);

			if (success) {
				updateLocalUser(userId);
				notifyDelete(pedido);
				setRecebidos(
					(prev) => prev?.filter((u) => u.id !== userId) || []
				);
			}

			return success;
		},
		[user?.id, updateLocalUser, notifyDelete]
	);

	const aceitarPedido = useCallback(
		async (userId: number) => {
			if (!user?.id) return false;

			const chatSuccess = await requestService.createChat(
				userId,
				user.id
			);

			if (chatSuccess) {
				const pedido = `${userId},${user.id}`;
				const deleteSuccess = await requestService.deleteRequest(
					pedido
				);

				if (deleteSuccess) {
					updateLocalUser(userId);
					notifyDelete(pedido);
					setRecebidos(
						(prev) => prev?.filter((u) => u.id !== userId) || []
					);
				}
				return deleteSuccess;
			}

			return false;
		},
		[user?.id, updateLocalUser, notifyDelete]
	);

	const cancelarPedido = useCallback(
		async (userId: number) => {
			if (!user?.id) return false;

			const pedido = `${user.id},${userId}`;
			const success = await requestService.deleteRequest(pedido);

			if (success) {
				updateLocalUser(userId);
				notifyDelete(pedido);
				setEnviados(
					(prev) => prev?.filter((u) => u.id !== userId) || []
				);
			}

			return success;
		},
		[user?.id, updateLocalUser, notifyDelete]
	);

	const enviarPedido = useCallback(
		async (userId: number) => {
			if (!user?.id) return false;

			const pedido = `${user.id},${userId}`;
			const success = await requestService.createRequest(pedido);

			if (success) {
				// Atualiza localmente
				const updatedPedidos = [
					...(user.pedidos || []),
					pedido.split(","),
				];
				setUser({ ...user, pedidos: updatedPedidos });
				notifyCreate(pedido);
			}

			return success;
		},
		[user, setUser, notifyCreate]
	);

	// 🔥 Status do usuário (para NewChat)

	const getUserStatus = useCallback(
		(
			userId: number,
			chats?: any[]
		): "sent" | "recieved" | "inChat" | undefined => {
			if (!user?.pedidos) return undefined;

			// Verifica se já está em chat
			if (chats) {
				const isInChat = chats.some(
					(chat) =>
						chat.tipo === "privado" &&
						chat.chat_name ===
							[recebidos, enviados]
								.flat()
								.find((u) => u?.id === userId)?.user_name
				);
				if (isInChat) return "inChat";
			}

			// Verifica pedidos
			const pedido = user.pedidos.find((p) => p.includes(String(userId)));
			if (pedido) {
				return pedido[0] === String(user.id) ? "sent" : "recieved";
			}

			return undefined; // Retorna undefined em vez de null
		},
		[user?.pedidos, user?.id, recebidos, enviados]
	);

	return {
		recebidos,
		enviados,
		isLoading,
		rejeitarPedido,
		aceitarPedido,
		cancelarPedido,
		enviarPedido,
		loadRequests,
		getUserStatus,
		clearRequests: useCallback(() => {
			setRecebidos(null);
			setEnviados(null);
		}, []),
	};
}
