import { createContext } from "react";
export interface ChatContextType {
	isChatOpen: boolean;
	setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChatContext = createContext<ChatContextType | null>(null);
