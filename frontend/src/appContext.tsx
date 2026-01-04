import { createContext } from "react";

export type UserType = {
	id: number;
	user_name: string;
	email_address: string;
	profile_img: string; // URL ou base64
	created_at: string;  // ISO string
};

export interface AppContextType {
	user: UserType | null;
	setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

export const appContext = createContext<AppContextType | undefined>(undefined);
