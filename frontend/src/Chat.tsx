import { useParams } from "react-router-dom";
import { useUser } from "./useUser";
import { useOutletContext, useNavigate, Link } from "react-router-dom";
import { useChat } from "./useChat";
import { useEffect, useState } from "react";
import { EditableBox } from "./msgInput";

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

export default function Chat() {
	const { chats, openedChat, setOpenedChats } = useOutletContext<{
		chats: Chat[];
		openedChat: string | null;
		setOpenedChats: React.Dispatch<React.SetStateAction<string | null>>;
	}>();

	const host = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

	const { chatid } = useParams();

	const { isChatOpen, setIsChatOpen } = useChat();
	const { user } = useUser();

	const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined);

	const backButtonHandler = () => {
		navigate("/direct");
		setIsChatOpen(false);
		setOpenedChats(null);
	};

	const sendMessage = (value: string) => {
		const conteudo = value;
		const userId = user?.id;

		fetch(`${host}/new_msg`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				conteudo,
				userId,
				chatId: chatid,
			}),
		})
			.then((res) => res.text())
			.then((data) => console.log(data));
	};

	useEffect(() => {
		if (!chats || !chatid) return;
		const foundChat = chats.find((chat) => chat.id === chatid);

		setCurrentChat(foundChat);
		setIsChatOpen(true);
		setOpenedChats(chatid);
	}, [chatid, chats, openedChat, setOpenedChats]);

	return (
		<>
			{currentChat ? (
				<div
					className={`fade wrapper overflow-hidden max-h-dvh w-full ${
						isChatOpen ? "" : "hidden"
					}`}>
					<div className="h-dvh w-full flex flex-col text-sm">
						{/* HEADER */}
						<div className="flex gap-1 items-center h-16 shrink-0">
							<div
								onClick={() => {
									backButtonHandler();
								}}
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

							<div className="avatar h-10 aspect-square rounded-full ml-2">
								<img
									className="w-full no-select rounded-full"
									src={`/Avatars/avatar (${currentChat?.profile_img}).png`}
								/>
							</div>

							<div className="pl-2">
								<p className="user-name">
									{currentChat?.chat_name}
								</p>
								{/* CHAT / SCROLL    <p className="text-sm">Online</p> */}
							</div>
						</div>

						<div className="messages-wrapper flex-1 overflow-y-auto p-5 pb-0 flex flex-col">
							{currentChat?.msgs.map((msg, index) => {
								const msgAuthor = currentChat.participants.find(
									(p) => p.id === msg.user_id
								);

								const isMe = msg.user_id === user?.id;
								const isFirstMsg =
									index === 0 ||
									currentChat.msgs[index - 1].user_id !==
										msg.user_id;

								return (
									<div
										key={index}
										className={`flex ${
											isFirstMsg ? "mt-10 relative" : ""
										} gap-3 ${
											isMe
												? "justify-end"
												: "justify-start"
										} items-start`}>
										{!isMe && isFirstMsg && (
											<>
												<p className="absolute left-12 text-[12px] text-gray-300 -top-4">
													{msgAuthor.user_name}
												</p>

												<img
													className="aspect-square no-select h-8 rounded-full mt-2"
													src={`/Avatars/avatar (${msgAuthor?.profile_img}).png`}
													alt=""
												/>
											</>
										)}

										{!isMe && !isFirstMsg && (
											<div className="w-8" />
										)}

										<div className="my-1">
											<p
												className={`max-w-xs p-2 rounded-lg ${
													isMe
														? "verde-1 text-white text-right"
														: "cinza-1 text-left"
												}`}>
												{msg.conteudo}
											</p>
										</div>
									</div>
								);
							})}
						</div>

						{/* INPUT */}
						<div className="shrink-0 px-4 pb-1">
							<EditableBox onAction={sendMessage} />
						</div>
					</div>
				</div>
			) : (
				<>
					<div className="h-dvh flex items-center justify-center flex-col ">
						<h1 className="font-bold text-2xl mb-5">
							404. Chat não encontrado
						</h1>
						<Link to={"/direct"}>Clique aqui link para voltar</Link>
					</div>
				</>
			)}
		</>
	);
}
