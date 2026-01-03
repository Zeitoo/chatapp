import { useParams } from "react-router-dom";
import { useContext } from "react";
import { appContext } from "./appContext";
import { ChatContext } from "./chatContext";

export default function Chat() {
	const { chatid } = useParams<{ chatid: string }>();
	const name = useContext(appContext);

	const chatContext = useContext(ChatContext);

	if (!chatContext) {
		throw new Error("ChatContext usado fora do Provider");
	}

	const { isChatOpen, setIsChatOpen } = chatContext;

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

	return (
		<>
			<div className={`${isChatOpen ? "bg-black" : "hidden"}`}>
				<div className="h-screen flex flex-col w-full text-sm">
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
						<div className="avatar h-10 aspect-square bg-indigo-400 rounded-[200px] inline-block ml-2"></div>
						<div className="pl-2">
							<p className="user-name">User1234</p>
							<p className="text-sm">Online</p>
						</div>
					</div>
					<div className="relative overflow-auto h-full flex flex-col">
						{chats
							.find((chat) => chat.chatId === chatid)
							?.msgs.map((msg, index) => {
								const isMe = msg.author === name;

								return (
									<div
										key={index}
										className={`flex ${
											isMe
												? "justify-end"
												: "justify-start"
										} my-2`}>
										<p
											className={`max-w-xs p-2 rounded-lg ${
												isMe
													? "bg-blue-500 text-white text-right"
													: "bg-gray-200 text-left"
											}`}>
											{msg.content}
										</p>
									</div>
								);
							})}
					</div>
					<div className="relative">
						<form action="">
							<input
								type="text"
								className="p-2 px-4 w-full rounded-[100px] outline-0 border"
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
