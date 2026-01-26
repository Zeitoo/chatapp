import { createContext } from "react";
import type { User } from "../Types";

export interface AppContextType {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	ws: React.RefObject<WebSocket | null>;
}

export const appContext = createContext<AppContextType | undefined>(undefined);
