import "./App.css";
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "./useUser";

function Direct() {
	const host = import.meta.env.VITE_API_URL;
	const [openedChat, setOpenedChats] = useState<string | null>(null);

	const navigate = useNavigate();

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
	}

	const [chats, setChats] = useState<Chat[] | null>(null);

	const { user } = useUser();

	function clickHandler(chatId: string) {
		navigate(`/direct/${chatId}`);
	}

	useEffect(() => {
		setTimeout(() => {
			if (!user) return;

			fetch(`${host}/chats`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(user),
			})
				.then((res) => res.json())
				.then((data) => {
					setChats(Array.from(data));
				});
		}, 500);
	}, [user]);

	return (
		<>
			<div className="flex text-gray-100 h-screen">
				
				<div className="p-4 h-full bg-castanho md:w-125 text-sm">
					<div className="flex justify-between items-center my-5">
						<div className="avatar flex justify-center  items-center gap-2">
							<div className="avatar-profile overflow-hidden h-15 aspect-square rounded-[200px] bg-indigo-500">
								<img
									className="w-full"
									src={`/Avatars/avatar (${user?.profile_img}).png`}
								/>
							</div>
							<p className="user-name">{user?.user_name}</p>
						</div>
						<div className="new-msg">
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
									d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
								/>
							</svg>
						</div>
					</div>
					<div>
						<input
							className="chat-search w-full p-5 py-2 text-sm rounded-[500px] outline-0"
							type="text"
							name="chat"
							id="chat"
							placeholder="Search"
						/>
					</div>
					<div className="my-5 flex justify-between items-center">
						<h1 className="font-medium">Mensagens</h1>
						<a href="">Pedidos</a>
					</div>
					<div>
						<div className="flex flex-col">
							{chats?.map((element) => {
								const timeStamp = element.msgs?.[0]?.enviado_em;

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
										<div className="profileImg h-11 aspect-square rounded-[200px]">
											<img
												className="w-full aspect-square rounded-[200px]"
												src={`/Avatars/avatar (${element.profile_img}).png`}
											/>
										</div>

										<div>
											<p className="text-sm font-medium">
												{element.chat_name}
											</p>
											<p className="truncate-2">
												{element.msgs?.[0]?.conteudo}
											</p>
										</div>

										<div className="items-center ml-auto">
											<p className="text-xs text-gray-500">
												{hora}
											</p>
											<div className="badge"></div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				<div className="w-full chat-wrapper">
					<Outlet context={{chats, openedChat, setOpenedChats}} />
				</div>
			</div>
		</>
	);
}

export default Direct;
