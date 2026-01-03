import { createContext } from "react";

type userType = {
		id: number;
		user_name: string;
		email_address: string;
		profile_img: Blob;
		created_at: Date;
	};

interface appContextType {
	user: userType | null;
	setUser: React.Dispatch<React.SetStateAction<userType | null>>;
}



export const appContext = createContext<appContextType |undefined>(undefined);
