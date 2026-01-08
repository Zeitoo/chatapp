import { useParams } from "react-router-dom";
import { useUser } from "./useUser";
import { useOutletContext } from "react-router-dom";
import { useChat } from "./useChat";
import { useEffect, useState } from "react";

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

	const { chatid } = useParams();

	const { isChatOpen, setIsChatOpen } = useChat();
	const { user } = useUser();

	const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined);

	useEffect(() => {
		if (!chats || !chatid) return;
		const foundChat = chats.find((chat) => chat.id === chatid);
		setCurrentChat(foundChat);
		setIsChatOpen(true);
		setOpenedChats(chatid);
	}, [chatid, chats, openedChat, setOpenedChats]);

	return (
		<>
			<div
				className={`wrapper overflow-hidden max-h-full w-full p-6 pr-0 ${
					isChatOpen ? "" : "hidden"
				}`}>
				<div className="h-screen w-full flex flex-col  text-sm">
					<div className="flex gap-1 items-center ">
						<div className="back-btn">
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
									d="M15.75 19.5 8.25 12l7.5-7.5"
								/>
							</svg>
						</div>
						<div className="avatar h-12 aspect-square rounded-[200px] inline-block ml-2">
							<img
								className="w-full rounded-[200px]"
								src={`/Avatars/avatar (${currentChat?.profile_img}).png`}
							/>
						</div>
						<div className="pl-2">
							<p className="user-name">User1234</p>
							<p className="text-sm">Online</p>
						</div>
					</div>

					<div className="relative p-5 pb-0 overflow-auto h-full flex flex-col">
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
									className={`flex gap-3 ${
										isMe ? "justify-end" : "justify-start"
									} items-start`}>
									{/* avatar só aparece se for a primeira da sequência */}
									{!isMe && isFirstMsg && (
										<img
											className="aspect-square h-8 rounded-full mt-2"
											src={`/Avatars/avatar (${msgAuthor?.profile_img}).png`}
											alt=""
										/>
									)}

									{/* espaço fantasma pra alinhar quando não tem avatar */}
									{!isMe && !isFirstMsg && (
										<div className="w-8" />
									)}

									<div
										className={`flex ${
											isMe
												? "justify-end"
												: "justify-start"
										} my-1`}>
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

					<div className="relative -top-9.5">
						<form action="">
							<input
								type="text"
								className="p-2 px-4 w-[96%] rounded-[100px] outline-0 border"
								name="new_msg"
								id="new-msg"
								placeholder="Mensagem..."
							/>
							<div className="absolute -right-1 top-1/2 -translate-1/2">
								<button>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
										className="size-5">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="m8.25 4.5 7.5 7.5-7.5 7.5"
										/>
									</svg>
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
