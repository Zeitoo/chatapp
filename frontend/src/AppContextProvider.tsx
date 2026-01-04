import { useState } from "react";
import { appContext } from "./appContext";

export type UserType = {
	id: number;
	user_name: string;
	email_address: string;
	profile_img: string; // URL ou base64
	created_at: string; // ISO string
};

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserType | null>(null);

	return (
		<appContext.Provider value={{ user, setUser }}>
			{children}
		</appContext.Provider>
	);
}
