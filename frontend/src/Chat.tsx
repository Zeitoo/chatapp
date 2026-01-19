// Chat.tsx
import { useEffect } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useUser } from "./Hooks/useUser";
import { useChat } from "./Hooks/useChat";
import { useCurrentChat } from "./Hooks/UseCurrentChat";
import { useSendMessage } from "./Hooks/SendMessage";
import type { ChatContextType } from "./Types";
import { ChatHeader } from "./Components/Chat/Header";
import { MessageList } from "./Components/Chat/Messages";
import { ChatNotFound } from "./Components/Chat/ChatNotFound";
import { EditableBox } from "./msgInput";

export default function Chat() {
	const { chats, setOpenedChats } = useOutletContext<ChatContextType>();
	const navigate = useNavigate();
	const { chatid } = useParams();
	const { setIsChatOpen } = useChat();
	const { user } = useUser();
	const { currentChat } = useCurrentChat(chatid, chats);
	const { sendMessage } = useSendMessage();

	const handleBack = () => {
		navigate("/direct");
		setIsChatOpen(false);
		setOpenedChats(null);
	};

	const handleSendMessage = (content: string) => {
		sendMessage(currentChat, content);
	};

	
	// Efeito para gerenciar estado do chat aberto
	useEffect(() => {
		if (!chatid) return;
		setIsChatOpen(true);
		setOpenedChats(chatid);
	}, [chatid, setIsChatOpen, setOpenedChats]);

	if (!currentChat) {
		return <ChatNotFound />;
	}

	return (
		<div className={`fade wrapper overflow-hidden max-h-dvh w-full`}>
			<div className="h-dvh w-full flex flex-col text-sm">
				<ChatHeader
					currentChat={currentChat}
					onBack={handleBack}
				/>
				<MessageList
					currentChat={currentChat}
					currentUserId={user?.id}
				/>
				<div className="shrink-0 px-4 pb-1">
					<EditableBox onAction={handleSendMessage} />
				</div>
			</div>
		</div>
	);
}
