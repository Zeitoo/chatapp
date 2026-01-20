// components/MessageList.tsx
import type { Chat } from "../../Types";
import { MessageItem } from "./Message";
import { useEffect, useRef } from "react";

interface MessageListProps {
	currentChat: Chat;
	currentUserId?: number;
}

export function MessageList({ currentChat, currentUserId }: MessageListProps) {
	const messageWrapper = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!messageWrapper.current) return;

		messageWrapper.current.scrollTop =
			messageWrapper.current?.scrollHeight ?? 0;
	}, [currentChat]);

	return (
		<div
			ref={messageWrapper}
			className="scroll-thin flex-1 overflow-y-auto p-5 pb-0 flex flex-col">
			{currentChat.msgs.map((msg, index) => {
				const msgAuthor = currentChat.participants.find(
					(p) => p.id === msg.user_id
				);

				const isMe = msg.user_id === currentUserId;
				const isFirstMsg =
					index === 0 ||
					currentChat.msgs[index - 1].user_id !== msg.user_id;

				return (
					<MessageItem
						key={msg.id}
						msg={msg}
						author={msgAuthor}
						isMe={isMe}
						isFirstMsg={isFirstMsg}
					/>
				);
			})}
		</div>
	);
}
