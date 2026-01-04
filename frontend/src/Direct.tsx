import "./App.css";
import { ChatContext } from "./chatContext";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useUser } from "./useUser";

function Direct() {
	const host = import.meta.env.VITE_API_URL;

	type chatsType = {
		chat_name: String;
		criado_em: string;
		id: string;
		tipo: string;
		msgs: number[];
	};

	const [chats, setChats] = useState<chatsType[] | null>(null);

	const { user } = useUser();

	const [isChatOpen, setIsChatOpen] = useState<boolean>(true);

	interface ChatOutletContext {
		isChatOpen: boolean;
		setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
	}

	useEffect(() => {
		setTimeout(() => {
			if (!user) return;

			fetch(`${host}/chats`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user }),
			})
				.then((res) => res.json())
				.then((data) => setChats(Array.from(data)));
		}, 500);
	}, [user]);

	return (
		<>
			<div className="flex gap-4 h-screen">
				<div className="p-4 h-full md:w-125 text-sm">
					<div className="flex justify-between items-center my-5">
						<div className="avatar flex justify-center items-center gap-2">
							<div className="avatar-profile h-10 aspect-square rounded-[200px] bg-indigo-500"></div>
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
							className="w-full p-5 py-2 text-sm border rounded-[500px] focus:border-indigo-600 outline-0"
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
						<div className="flex gap-2 flex-col">
							{chats?.map((element) => {
								return (
									<>
										<div>
											<div className="flex items-center justify-start gap-2 my-2">
												<div
													className={`${"profileImg"}  h-15 aspect-square rounded-[200px] `}></div>
												<div>
													<p className="text-sm font-medium">
														{"userName"}
													</p>
													<p>{"lastMessage"}</p>
												</div>
												<div className="items-center ml-auto">
													<div>
														<p className="text-xs text-gray-500">
															{"formattedTime"}
														</p>
													</div>
													<div className="badge"></div>
												</div>
											</div>
										</div>
									</>
								);
							})}
						</div>
					</div>
				</div>

				<div
					className={`p-4 w-full text-sm ${
						isChatOpen ? "" : "hidden"
					}`}>
					<ChatContext.Provider value={{ isChatOpen, setIsChatOpen }}>
						<Outlet />
					</ChatContext.Provider>
				</div>
			</div>
		</>
	);
}

export default Direct;
