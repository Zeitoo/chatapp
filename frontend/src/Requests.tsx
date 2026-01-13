import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "./useUser";
import { useChat } from "./useChat";

interface User {
	id: number;
	user_name: string;
	email_address: string;
	profile_img: number;
	created_at: string;
}

interface Msg {
	id: number;
	chat_id: string;
	user_id: number;
	conteudo: string;
	enviado_em: string; // ISO timestamp
}

interface Chat {
	id: string;
	tipo: "grupo" | "individual"; // se souberes os tipos possíveis
	criado_em: string; // ISO timestamp
	chat_name: string;
	profile_img: number;
	msgs: Msg[]; // array de mensagens
	lastUser?: number | null;
	participants: object[];
}

export function Requests() {
	const navigate = useNavigate();
	const [recebidos, setRecebidos] = useState<User[] | null>(null);
	const [enviados, setEnviados] = useState<User[] | null>(null);

	const { user, setUser } = useUser();
	const { setOpenedChats } = useOutletContext<{
		chats: Chat[];
		openedChat: string | null;
		setOpenedChats: React.Dispatch<React.SetStateAction<string | null>>;
	}>();

	const { setIsChatOpen } = useChat();
	const host = import.meta.env.VITE_API_URL;

	const backButtonHandler = () => {
		navigate("/direct");
	};

	const deletFetch = async (pedido: string) => {
		const response = await fetch(`${host}/pedido`, {
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
		fetch(`${host}/new_chat`, {
			method: "PUT",
			body: JSON.stringify({
				users: [userId, user?.id],
			}),
			headers: {
				"Content-Type": "application/json",
			},
		}).then((res) => {
			if (res.ok) {
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

	useEffect(() => {
		if (!user) return;
		if (!user.pedidos) return;
		const recebidosArray: string[] = [];
		const enviadosArray: string[] = [];

		for (let c of user.pedidos) {
			if (Number(c[0]) === user.id) {
				enviadosArray.push(c[1]);
			} else {
				recebidosArray.push(c[0]);
			}
		}

		if (enviadosArray.length > 0) {
			fetch(`${host}/users`, {
				method: "POST",
				body: JSON.stringify({ users: enviadosArray }),
				headers: { "Content-Type": "application/json" },
			})
				.then((res) => {
					return res.json();
				})
				.then((data) => {
					if (!data.message) {
						setEnviados(data);
					}
				});
		}

		if (recebidosArray.length > 0) {
			fetch(`${host}/users`, {
				method: "POST",
				body: JSON.stringify({ users: recebidosArray }),
				headers: { "Content-Type": "application/json" },
			})
				.then((res) => {
					return res.json();
				})
				.then((data) => {
					if (!data.message) {
						setRecebidos(data);
					}
				});
		}

		setIsChatOpen(true);
		setOpenedChats("abcd");
	}, [user]);

	return (
		<>
			<div className="max-h-dvh pedidos overflow-y-auto ">
				<div className="flex items-center">
					<div
						onClick={() => {
							backButtonHandler();
						}}
						className="back-btn cursor flex items-center ml-4">
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
					<h1 className="font-bold mx-2 m-5 text-xl">Pedidos</h1>
				</div>
				<div className="p-5 pr-2 text-sm  flex flex-col gap-4">
					<div>
						<p className="font-bold">Recebidos</p>
						<div>
							<div>
								{recebidos?.map((element) => {
									return (
										<div className="m-2 my-3 profile flex items-center justify-between gap-2 p-3 rounded-lg">
											<div className="flex items-center gap-3">
												<img
													className="w-13 no-select rounded-full"
													src={`/Avatars/avatar (${element?.profile_img}).png`}
													alt=""
												/>
												<p className="font-medium">
													{element.user_name}
												</p>
											</div>
											<div className="flex gap-3 items-center">
												<button
													onClick={() => {
														rejeitarPedido(
															element.id
														);
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
														aceitarPedido(
															element.id
														);
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
										</div>
									);
								})}
							</div>
						</div>
					</div>
					<div>
						<p className="font-bold">Enviados</p>
						<div>
							<div>
								{enviados?.map((element) => {
									return (
										<div className="m-2 my-3 profile flex items-center justify-between gap-2 p-3 rounded-lg">
											<div className="flex items-center gap-3">
												<img
													className="w-13 no-select rounded-full"
													src={`/Avatars/avatar (${element?.profile_img}).png`}
													alt=""
												/>
												<p className="font-medium">
													{element.user_name}
												</p>
											</div>
											<div className="flex gap-3 items-center">
												<button
													onClick={() => {
														cancelarPedido(
															element.id
														);
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
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
