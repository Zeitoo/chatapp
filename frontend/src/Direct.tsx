import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useUser } from "./Hooks/useUser";
import { useChat } from "./Hooks/useChat";

function Direct() {
	const route = useLocation();
	const host = import.meta.env.VITE_API_URL;
	let chatId = route.pathname.replaceAll("/", "").replace("direct", "");

	const [hasPedidos, setHasPedidos] = useState<boolean>(false);

	const [openedChat, setOpenedChats] = useState<string | null>(
		chatId.length > 0 ? chatId : null
	);

	const navigate = useNavigate();

	const { chats, setChats } = useChat();

	const { user } = useUser();

	function clickHandler(chatId: string) {
		navigate(`/direct/${chatId}`);
	}

	useEffect(() => {
		if (!openedChat) {
			setOpenedChats(null);
		}
		setTimeout(() => {
			if (!user) return;

			if (user.pedidos) {
				user.pedidos.length > 0 ? setHasPedidos(true) : "";
			}

			fetch(`${host}/chats`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(user),
			})
				.then((res) => res.json())
				.then((data) => {
					const dados = [];

					for (let chat of data) {
						dados.push(chat);
					}
					setChats(dados);
				});
		}, 500);
	}, [user, openedChat]);

	return (
		<>
			<div className="flex text-gray-100 h-dvh">
				<div
					className={`fade flex flex-col max-h-dvh ${
						openedChat ? "direct-sidebar" : "w-full"
					} p-4 h-full bg-castanho md:w-125 text-sm`}>
					<div className="flex justify-between  items-center my-5">
						<div className="avatar flex justify-center  items-center gap-2">
							<div className="avatar-profile overflow-hidden h-15 aspect-square rounded-[200px] bg-indigo-500">
								<img
									className="w-full no-select"
									src={`/Avatars/avatar (${user?.profile_img}).png`}
								/>
							</div>
							<p
								className={`user-name ml-1 no-select font-bold md:block ${
									openedChat ? "hidden" : ""
								}`}>
								{user?.user_name}
							</p>
						</div>
						{openedChat ? (
							""
						) : (
							<div className="new-msg">
								<Link to={"new_chat"}>
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
											d="M12 4.5v15m7.5-7.5h-15"
										/>
									</svg>
								</Link>
							</div>
						)}
					</div>
					<div className="">
						<input
							className={`chat-search text-sm rounded-[500px] w-full outline-0  ${
								openedChat
									? "open-chat-search w-0 opacity-0 md:w-full md:opacity-100 md:px-5 py-2"
									: "p-5 py-2"
							} `}
							type="text"
							name="chat"
							id="chat"
							placeholder="Search"
						/>
					</div>
					<div className="my-5  flex justify-between items-center">
						<>
							<h1
								className={`no-select ${
									openedChat ? "hidden md:block" : ""
								} font-medium`}>
								Mensagens
							</h1>
							<Link
								className={`${
									openedChat ? "hidden md:block" : ""
								} ${
									hasPedidos ? "text-green-400 font-bold" : ""
								}`}
								to={"pedidos"}>
								Pedidos
							</Link>
						</>
					</div>
					<div className="scroll-thin flex-1 overflow-y-auto">
						<div className="flex flex-col">
							<hr
								className={`opacity-0  ${
									openedChat ? "md:opacity-0 opacity-100" : ""
								}`}
							/>
							{chats?.map((element) => {
								let lastMessage;
								const timeStamp = element.msgs?.[0]?.enviado_em;

								if (element.msgs.length !== 0) {
									lastMessage =
										element.msgs[element.msgs.length - 1]
											.conteudo;
								}

								const hora = timeStamp
									? new Date(timeStamp).toLocaleTimeString(
											"pt-PT",
											{
												hour: "2-digit",
												minute: "2-digit",
											}
									  )
									: "";

								return (
									<div
										key={element.id}
										onClick={() => clickHandler(element.id)}
										className={`chat-selector flex p-2 rounded-[10px] items-center justify-start gap-2 my-1 ${
											openedChat == element.id
												? "cinza-2"
												: "hover:bg-cinza-2 cursor-pointer"
										}`}>
										<div className="profileImg h-11 aspect-square mr-2 rounded-[200px]">
											<img
												className="no-select w-full ml-1 aspect-square rounded-[200px]"
												src={`/Avatars/avatar (${element.profile_img}).png`}
											/>
										</div>

										<div
											className={`${
												openedChat
													? "hidden md:block"
													: ""
											}`}>
											<p className="text-sm font-medium">
												{element.chat_name}
											</p>
											<p className="truncate-2">
												{lastMessage}
											</p>
										</div>

										<div className="items-center ml-auto">
											{openedChat ? (
												""
											) : (
												<p className="text-xs text-gray-500">
													{hora}
												</p>
											)}

											<div className="badge"></div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				<div
					className={`chat-wrapper w-0 ${
						openedChat ? "w-full" : "md:w-full"
					}`}>
					<Outlet context={{ chats, openedChat, setOpenedChats }} />
				</div>
			</div>
		</>
	);
}

export default Direct;
