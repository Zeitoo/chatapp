import { createContext } from "react"

interface ChatContextType {
  isChatOpen: boolean
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const ChatContext = createContext<ChatContextType | null>(null)
