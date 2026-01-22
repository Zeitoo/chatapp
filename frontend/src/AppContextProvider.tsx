import { useState, useRef } from "react";
import { appContext } from "./appContext";
import type { User } from "./Types";


export function AppProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const ws = useRef<WebSocket | null>(null);

	return (
		<appContext.Provider value={{ user, setUser, ws }}>
			{children}
		</appContext.Provider>
	);
}
