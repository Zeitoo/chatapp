import { useState } from "react";
import { ChatContext } from "./chatContext";
export interface ChatContextType {
	isChatOpen: boolean;
	setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ChatProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

	return (
		<ChatContext.Provider value={{ isChatOpen, setIsChatOpen }}>
			{children}
		</ChatContext.Provider>
	);
}
