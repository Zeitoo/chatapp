import "./App.css";
import { ChatContext } from "./chatContext";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useUser } from "./useUser";

function Direct() {
	const { user } = useUser();
	const currentUser = "User123";

	const [isChatOpen, setIsChatOpen] = useState<boolean>(true);

	interface ChatOutletContext {
		isChatOpen: boolean;
		setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
	}

	type ChatType = "private" | "group";

	interface Message {
		author: string;
		content: string;
		timestamp: string; // ISO 8601
	}

	interface Chat {
		chatId: string;
		type: ChatType;
		users: string[];
		msgs: Message[];
	}

	const chats: Chat[] = [
		{
			chatId: "kh1223c2xg",
			type: "private",
			users: ["User123", "User456"],
			msgs: [
				{
					author: "User123",
					content: "Hello!",
					timestamp: "2024-06-01T10:00:00Z",
				},
				{
					author: "User456",
					content: "Hi there!",
					timestamp: "2024-06-01T10:05:00Z",
				},
			],
		},
		{
			chatId: "pr8891aa9",
			type: "private",
			users: ["User789", "User123"],
			msgs: [
				{
					author: "User789",
					content: "Are you coming to the meeting?",
					timestamp: "2024-06-02T14:20:00Z",
				},
				{
					author: "User123",
					content: "Yes, I'll be there in 10 minutes.",
					timestamp: "2024-06-02T14:22:00Z",
				},
			],
		},
		{
			chatId: "gr5510zzq",
			type: "group",
			users: ["User123", "User456", "User789"],
			msgs: [
				{
					author: "User456",
					content: "Did anyone finish the assignment?",
					timestamp: "2024-06-03T08:10:00Z",
				},
				{
					author: "User789",
					content: "Almost done, just reviewing.",
					timestamp: "2024-06-03T08:12:00Z",
				},
				{
					author: "User123",
					content: "Same here.",
					timestamp: "2024-06-03T08:15:00Z",
				},
			],
		},
	];

	interface User {
		userId: string;
		profileImg: string;
		userName: string;
		email: string;
	}

	const users: User[] = [
		{
			userId: "User123",
			profileImg: "bg-blue-500",
			userName: "Alex",
			email: "alex@alex.com",
		},
		{
			userId: "User456",
			profileImg: "bg-red-500",
			userName: "Joseph",
			email: "joseph@joseph.com",
		},
		{
			userId: "User789",
			profileImg: "bg-green-500",
			userName: "Maria",
			email: "maria@maria.com",
		},
		{
			userId: "User999",
			profileImg: "bg-purple-500",
			userName: "Daniel",
			email: "daniel@daniel.com",
		},
	];

	useEffect(() => {
		document.title = "Direct";

		
	});

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
						{chats.map((chat) => {
							let chatUserID = chat.users
								.map((user) => {
									if (user !== currentUser) {
										return user;
									}
								})
								.join("");

							let profileImg = users
								.map((user) => {
									if (user.userId === chatUserID) {
										return user.profileImg + " ";
									}
								})
								.filter((element) => !!element)
								.join("");

							let userName = users.map((user) => {
								if (user.userId === chatUserID) {
									return user.userName;
								}
							});

							let lastMessage =
								chat.msgs[chat.msgs.length - 1].content;

							let date = new Date(
								chat.msgs[chat.msgs.length - 1].timestamp
							);
							let hours = date
								.getHours()
								.toString()
								.padStart(2, "0");
							let minutes = date
								.getMinutes()
								.toString()
								.padStart(2, "0");
							let formattedTime = `${hours}:${minutes}`;

							return (
								<div className="flex gap-2 flex-col">
									<div>
										<div className="flex items-center justify-start gap-2 my-2">
											<div
												className={`${profileImg}  h-15 aspect-square rounded-[200px] `}></div>
											<div>
												<p className="text-sm font-medium">
													{userName}
												</p>
												<p>{lastMessage}</p>
											</div>
											<div className="items-center ml-auto">
												<div>
													<p className="text-xs text-gray-500">
														{formattedTime}
													</p>
												</div>
												<div className="badge"></div>
											</div>
										</div>
									</div>
								</div>
							);
						})}
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
