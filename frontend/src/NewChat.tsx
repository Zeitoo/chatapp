import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useUser } from "./Hooks/useUser";
import { useChat } from "./Hooks/useChat";
import { useRequests } from "./Hooks/UseRequests";
import { api } from "./auth/api";
import type { Chat, User as UserType } from "./Types";

interface SearchUser extends UserType {
	status?: "sent" | "recieved" | "inChat";
}

export default function NewChat() {
	const [inputValue, setInputValue] = useState("");
	const [results, setResults] = useState<SearchUser[]>([]);
	const [loading, setLoading] = useState(false);

	const timeoutRef = useRef<number | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const host = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();
	const { user: currentUser } = useUser();

	const { chats, setOpenedChats } = useOutletContext<{
		chats: Chat[];
		openedChat: string | null;
		setOpenedChats: React.Dispatch<React.SetStateAction<string | null>>;
	}>();

	const { setIsChatOpen } = useChat();
	const {
		rejeitarPedido,
		aceitarPedido,
		cancelarPedido,
		enviarPedido,
		getUserStatus,
	} = useRequests();

	// 🔥 Busca de usuários otimizada
	const searchUsers = useCallback(
		async (query: string) => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);

			abortRef.current?.abort();
			abortRef.current = new AbortController();

			setLoading(true);

			try {
				const response = await api.get<UserType[]>(
					`${host}/api/users/search/${encodeURIComponent(query)}`,
					{ signal: abortRef.current.signal }
				);

				const processedUsers: SearchUser[] = response.data.map(
					(userData) => ({
						...userData,
						status: getUserStatus(userData.id, chats),
					})
				);

				setResults(processedUsers);
			} catch (err: any) {
				if (err.name !== "CanceledError" && err.name !== "AbortError") {
					console.error("Erro na busca:", err);
					setResults([]);
				}
			} finally {
				setLoading(false);
			}
		},
		[chats, getUserStatus, host]
	);

	// 🔥 Handler de input com debounce
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setInputValue(value);

			if (value.trim().length < 3) {
				setResults([]);
				return;
			}

			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			timeoutRef.current = window.setTimeout(
				() => searchUsers(value),
				400
			);
		},
		[searchUsers]
	);

	// 🔥 Handlers de ações
	const handleAction = useCallback(
		async (
			userId: number,
			action: "rejeitar" | "aceitar" | "cancelar" | "enviar"
		) => {
			let success = false;

			switch (action) {
				case "rejeitar":
					success = await rejeitarPedido(userId);
					break;
				case "aceitar":
					success = await aceitarPedido(userId);
					break;
				case "cancelar":
					success = await cancelarPedido(userId);
					break;
				case "enviar":
					success = await enviarPedido(userId);
					break;
			}

			if (success) {
				// Atualiza UI localmente
				setResults((prev) =>
					prev.map((u) => {
						if (u.id === userId) {
							if (action === "enviar") {
								return { ...u, status: "sent" };
							} else if (action === "aceitar") {
								return { ...u, status: "inChat" };
							} else {
								return { ...u, status: undefined };
							}
						}
						return u;
					})
				);
			}

			return success;
		},
		[rejeitarPedido, aceitarPedido, cancelarPedido, enviarPedido]
	);

	// 🔥 Navigation
	const handleBack = useCallback(() => {
		setIsChatOpen(false);
		setOpenedChats(null);
		document.title = "Direct";
		navigate("/direct");
	}, [setIsChatOpen, setOpenedChats, navigate]);

	// 🔥 Renderização de botões de ação
	const renderActionButtons = (user: SearchUser) => {
		switch (user.status) {
			case "recieved":
				return (
					<>
						<button
							onClick={() => handleAction(user.id, "rejeitar")}
							aria-label={`Rejeitar pedido de ${user.user_name}`}
							className="p-2 hover:scale-110 scale-100 rounded-full cursor-pointer transition-all">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18 18 6M6 6l12 12"
								/>
							</svg>
						</button>
						<button
							onClick={() => handleAction(user.id, "aceitar")}
							aria-label={`Aceitar pedido de ${user.user_name}`}
							className="p-2 hover:bg-gray-100 rounded-full transition-colors">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m4.5 12.75 6 6 9-13.5"
								/>
							</svg>
						</button>
					</>
				);

			case "sent":
				return (
					<button
						onClick={() => handleAction(user.id, "cancelar")}
						aria-label={`Cancelar pedido enviado a ${user.user_name}`}
						className="p-2 hover:scale-110 scale-100  cursor-pointer transition-all rounded-full">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18 18 6M6 6l12 12"
							/>
						</svg>
					</button>
				);

			case "inChat":
				return (
					<span className="text-xs text-green-600 font-medium px-2">
						Já em chat
					</span>
				);

			default:
				if (!user.status && user.id !== currentUser?.id) {
					return (
						<button
							onClick={() => handleAction(user.id, "enviar")}
							aria-label={`Enviar pedido para ${user.user_name}`}
							className="p-2 hover:scale-110 rounded-full  cursor-pointer transition-all">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
								/>
							</svg>
						</button>
					);
				}
				return null;
		}
	};

	// 🔥 Effects
	useEffect(() => {
		setIsChatOpen(true);
		setOpenedChats("abcd");
		document.title = "New Chats";

		return () => {
			setIsChatOpen(false);
			setOpenedChats(null);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			abortRef.current?.abort();
		};
	}, [setIsChatOpen, setOpenedChats]);

	return (
		<div className="new-chat max-h-dvh flex flex-col fade">
			<div className="p-5 mb-5 flex items-center gap-4">
				<button
					onClick={handleBack}
					className="back-btn ml-3.5 p-2 rounded-full transition-all hover:scale-110 cursor-pointer"
					aria-label="Voltar">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="size-6">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18 18 6M6 6l12 12"
						/>
					</svg>
				</button>
				<h1 className="font-bold text-lg">Novo Chat</h1>
			</div>

			<div className="px-4">
				<input
					value={inputValue}
					onChange={handleInputChange}
					className="chat-search text-sm rounded-[500px] w-full outline-0 p-5 py-2 border border-gray-300 focus:border-blue-500 transition-colors"
					type="text"
					placeholder="Procure por um usuário (mín. 3 caracteres)"
					maxLength={50}
					aria-label="Buscar usuário"
				/>
			</div>

			<div className="scroll-thin px-6 flex-1 mt-4 overflow-y-auto">
				{loading && (
					<p className="text-sm opacity-60 py-4">Buscando...</p>
				)}

				{!loading && results.length > 0 ? (
					results
						.filter((userData) => userData.id !== currentUser?.id)
						.map((userData) => (
							<div
								key={userData.id}
								className={`p-4 my-2 ${
									userData.status === "inChat" ||
									userData.status === "sent" ||
									userData.status === "recieved"
										? "bg-green-1"
										: "profile"
								} cursor-pointer rounded-lg flex justify-between`}>
								<div className="flex items-center gap-4">
									<div className="w-12 h-12">
										<img
											className="w-full h-full object-cover rounded-full"
											src={`/Avatars/avatar (${userData.profile_img}).png`}
											alt={`Avatar de ${userData.user_name}`}
										/>
									</div>
									<div>
										<p className="font-medium">
											{userData.user_name}
										</p>
										<p className="text-xs text-gray-500">
											{userData.email_address}
										</p>
									</div>
								</div>

								<div className="flex gap-1">
									{renderActionButtons(userData)}
								</div>
							</div>
						))
				) : !loading && inputValue.trim().length >= 3 ? (
					<p className="text-center mt-8 text-gray-500">
						Nenhum usuário encontrado
					</p>
				) : null}
			</div>
		</div>
	);
}
