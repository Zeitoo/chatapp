import { useUser } from "./Hooks/useUser";
import { useEffect, useRef, useState } from "react";
import { useChat } from "./Hooks/useChat";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { Chat } from "./Types";
interface User {
	id: number;
	user_name: string;
	email_address: string;
	profile_img: number;
	created_at: string;
	allready: undefined | "sent" | "recieved" | "inChat";
}

export default function NewChat() {
	const [inputValue, setInputValue] = useState<string>("");
	const [results, setResults] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [fecthData, setFetchData] = useState<User[] | []>([]);

	const timeoutRef = useRef<number | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const host = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();
	const { user, setUser } = useUser();

	const { chats, setOpenedChats } = useOutletContext<{
		chats: Chat[];
		openedChat: string | null;
		setOpenedChats: React.Dispatch<React.SetStateAction<string | null>>;
	}>();

	const { setIsChatOpen } = useChat();

	const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const deletFetch = async (pedido: string) => {
		const response = await fetch(`${host}/api/pedidos/`, {
			method: "DELETE",
			body: JSON.stringify({
				pedido,
			}),
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (response.ok) {
			return true;
		} else {
			return false;
		}
	};

	const putChatFetch = async (userId: number) => {
		fetch(`${host}/api/chats/new_chat`, {
			method: "PUT",
			body: JSON.stringify({
				users: [userId, user?.id],
			}),
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		}).then((res) => {
			if (res.ok) {
				console.log("sucesso...");
				if (!user?.pedidos) {
					return;
				}
				const pedidos = user?.pedidos.filter(
					(element) => !element.includes(String(userId))
				);

				setUser({
					id: user?.id,
					user_name: user?.user_name,
					email_address: user?.email_address,
					profile_img: user?.profile_img,
					created_at: user?.created_at,
					pedidos: pedidos,
				});
			} else {
				console.log(res);
			}
		});
	};

	const rejeitarPedido = (userId: number) => {
		const pedido = `${userId},${user?.id}`;
		deletFetch(pedido).then((res) => {
			if (res) {
				if (!user?.pedidos) {
					return;
				}
				const pedidos = user?.pedidos.filter(
					(element) => !element.includes(String(userId))
				);

				setUser({
					id: user?.id,
					user_name: user?.user_name,
					email_address: user?.email_address,
					profile_img: user?.profile_img,
					created_at: user?.created_at,
					pedidos: pedidos,
				});
			}
		});
	};

	const aceitarPedido = (userId: number) => {
		putChatFetch(userId);
	};

	const cancelarPedido = (userId: number) => {
		const pedido = `${user?.id},${userId}`;
		deletFetch(pedido).then((res) => {
			if (res) {
				if (!user?.pedidos) {
					return;
				}
				const pedidos = user?.pedidos.filter(
					(element) => !element.includes(String(userId))
				);

				setUser({
					id: user?.id,
					user_name: user?.user_name,
					email_address: user?.email_address,
					profile_img: user?.profile_img,
					created_at: user?.created_at,
					pedidos: pedidos,
				});
			}
		});
	};

	const putPedido = async (userId: number) => {
		const destinatario = userId.toString();
		const remetente = user?.id?.toString();
		const pedido = `${remetente},${destinatario}`;

		try {
			const response = await fetch(`${host}/api/pedidos`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					pedido,
				}),
			});

			if (response.ok) {
				const tempUser = structuredClone(user);
				if (!tempUser?.pedidos) return;

				tempUser?.pedidos.push(pedido.split(","));
				setUser(tempUser);
			}
		} catch {
			console.log("deu erro");
		}
	};

	const tratarUsers = (data: User[]) => {
		let privateChats = null;
		if (chats) {
			privateChats = chats.filter(
				(element) => element.tipo === "privado"
			);
		}
		data = data.map((element) => {
			privateChats?.forEach((chat) => {
				if (chat.chat_name === element.user_name) {
					element.allready = "inChat";
				}
			});
			return element;
		});

		data.map((element) => {
			if (user?.pedidos) {
				const pedido = user?.pedidos.filter((pedido) => {
					return pedido.includes(String(element.id));
				});

				if (pedido.length > 0) {
					pedido[0],
						pedido[0].indexOf(String(user?.id)) === 0
							? (element.allready = "sent")
							: (element.allready = "recieved");
				}
			}
		});

		setResults(data);
	};

	useEffect(() => {
		tratarUsers(fecthData);
	}, [fecthData, user]);

	useEffect(() => {
		const query = inputValue.trim();

		if (query.length < 5) {
			setResults([]);
			return;
		}

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = window.setTimeout(async () => {
			abortRef.current?.abort();
			abortRef.current = new AbortController();

			setLoading(true);

			try {
				const res = await fetch(
					`${host}/api/users/search/${encodeURIComponent(query)}`,
					{ signal: abortRef.current.signal }
				);

				if (res.ok) {
					let data: User[] = await res.json();

					setFetchData(data);
				} else {
					setFetchData([]);
				}
			} catch (err: any) {
				if (err.name !== "AbortError") {
					console.error(err);
				}
			} finally {
				setLoading(false);
			}
		}, 400);

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [inputValue]);

	const backButtonHandler = () => {
		setIsChatOpen(false);
		setOpenedChats(null);
		document.title = "Direct";
		navigate("/direct");
	};

	useEffect(() => {
		setIsChatOpen(true);
		setOpenedChats("abcd");
		document.title = "New Chats";
	}, []);

	return (
		<div className="new-chat max-h-dvh flex flex-col  fade">
			<div className="p-5 mb-5 flex items-center gap-4">
				<div
					onClick={backButtonHandler}
					className="back-btn ml-3.5">
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
				</div>
				<h1 className="font-bold text-lg">Novo Chat</h1>
			</div>

			<div className="px-4">
				<input
					value={inputValue}
					onChange={inputChangeHandler}
					className="chat-search text-sm rounded-[500px] w-full outline-0 p-5 py-2"
					type="text"
					placeholder="Procure por um usuario"
					maxLength={50}
				/>
			</div>

			<div className="scroll-thin px-6 flex-1 mt-4 overflow-y-auto">
				{loading && <p className="text-sm opacity-60">Buscando...</p>}

				{results.length > 0 ? (
					results.map((u) => {
						return (
							<div
								key={u.id}
								className={`p-4 my-2 ${
									u.allready === "inChat" ||
									u.allready === "sent" ||
									u.allready === "recieved"
										? "bg-green-1"
										: "profile"
								} cursor-pointer rounded-lg flex justify-between hover:opacity-80`}>
								<div className="flex items-center gap-5">
									<div className="w-20">
										<img
											className="w-full no-select rounded-full"
											src={`/Avatars/avatar (${u?.profile_img}).png`}
										/>
									</div>
									<div>
										<p className="font-medium text-lg">
											{u.user_name}
										</p>
										<p className="text-xs opacity-60">
											{u.email_address}
										</p>
									</div>
								</div>
								{u?.allready === "recieved" ? (
									<div className="flex gap-3 items-center">
										<button
											onClick={() => {
												rejeitarPedido(u.id);
											}}
											className="cursor">
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
											onClick={() => {
												aceitarPedido(u.id);
											}}
											className="cursor">
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
									</div>
								) : (
									""
								)}

								{u?.allready === "sent" ? (
									<div className="flex gap-3 items-center">
										<button
											onClick={() => {
												cancelarPedido(u.id);
											}}
											className="cursor">
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
									</div>
								) : (
									""
								)}

								{!u.allready ? (
									<div className="flex items-center">
										<button
											onClick={(e) => {
												e.preventDefault();
												putPedido(u.id);
											}}
											className="cursor">
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
									</div>
								) : (
									""
								)}
							</div>
						);
					})
				) : (
					<p className="text-center mt-4 font-bold">
						User nao encontrado
					</p>
				)}
			</div>
		</div>
	);
}
