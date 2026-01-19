import { useState, useRef } from "react";
import { appContext } from "./appContext";

export type UserType = {
	id: number | undefined;
	user_name: string | undefined;
	email_address: string | undefined;
	profile_img: string | undefined; // URL ou base64
	created_at: string | undefined; // ISO string
	pedidos: string[] | undefined;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserType | null>(null);
	const ws = useRef<WebSocket | null>(null);

	return (
		<appContext.Provider value={{ user, setUser, ws }}>
			{children}
		</appContext.Provider>
	);
}
