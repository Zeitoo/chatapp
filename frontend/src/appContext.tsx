import { createContext } from "react";

export type UserType = {
	id: number | undefined;
	user_name: string | undefined;
	email_address: string | undefined;
	profile_img: string | undefined; // URL ou base64
	created_at: string | undefined; // ISO string
	pedidos: string[] | undefined;
};

export interface AppContextType {
	user: UserType | null;
	setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

export const appContext = createContext<AppContextType | undefined>(undefined);
