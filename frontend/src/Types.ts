// Types.ts

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	user: User;
}

export interface RefreshResponse {
	accessToken: string;
}

export interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<LoginResult>;
	logout: () => Promise<void>;
	loading: boolean;
	getAccessToken: () => string | null;
	setAccessToken: (token: string | null) => void;
}

export interface LoginResult {
	success: boolean;
	error?: string;
}

export interface User {
	id: number;
	user_name?: string;
	email_address?: string;
	profile_img?: string;
	created_at?: string;
	pedidos: string[][];
}

export interface Chat {
	id: string;
	tipo: "grupo" | "privado";
	criado_em: string;
	chat_name: string;
	profile_img: number;
	msgs: Msg[];
	lastUser?: number | null;
	participants: User[];
}

export interface Msg {
	id: number;
	chat_id: string;
	user_id: number;
	conteudo: string;
	enviado_em: string;
}

export interface ChatContextType {
	chats: Chat[];
	openedChat: string | null;
	setOpenedChats: React.Dispatch<React.SetStateAction<string | null>>;
}
// types/auth.types.ts
export interface UserSignUp {
	userName: string;
	profileImg: number | undefined;
	emailAddress: string;
	password: string;
}

export interface SignUpFormData {
	primeiroNome: string;
	apelido: string;
	emailAddress: string;
	password: string;
	avatar: number;
}

export interface ValidationError {
	field: string;
	message: string;
}

export interface SignUpStepProps {
	formData: SignUpFormData;
	onChange: (field: keyof SignUpFormData, value: string | number) => void;
	onNext: () => void;
	onBack?: () => void;
	errors?: ValidationError[];
	loading?: boolean;
	apiError?: string | null;
}
