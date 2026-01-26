import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../auth/api";
import type { AxiosError, AxiosRequestConfig } from "axios";

export interface User {
	id: string;
	name: string;
	email: string;
}

interface LoginResult {
	success: boolean;
	error?: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<LoginResult>;
	logout: () => Promise<void>;
	getAccessToken: () => string | null;
	setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);

	// access token só em memória
	const accessTokenRef = useRef<string | null>(null);

	const getAccessToken = () => accessTokenRef.current;
	const setAccessToken = (token: string | null) => {
		accessTokenRef.current = token;
	};

	/* ===== Interceptor de REQUEST ===== */
	useEffect(() => {
		const requestInterceptor = api.interceptors.request.use((config) => {
			const token = getAccessToken();

			if (token) {
				config.headers = config.headers ?? {};
				config.headers.Authorization = `Bearer ${token}`;
			}

			return config;
		});

		return () => {
			api.interceptors.request.eject(requestInterceptor);
		};
	}, []);

	/* ===== Interceptor de RESPONSE (refresh automático) ===== */
	useEffect(() => {
		const responseInterceptor = api.interceptors.response.use(
			(response) => response,
			async (error: AxiosError) => {
				const originalRequest = error.config as AxiosRequestConfig & {
					_retry?: boolean;
				};

				if (error.response?.status === 401 && !originalRequest._retry) {
					originalRequest._retry = true;

					try {
						const refreshResponse = await api.get(
							"/api/auth/refresh"
						);

						console.log(refreshResponse);
						const { access_token, user } = refreshResponse.data;

						setAccessToken(access_token);
						if (user) setUser(user);

						originalRequest.headers = originalRequest.headers ?? {};
						originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`;

						return api(originalRequest);
					} catch {
						setAccessToken(null);
						setUser(null);
						return Promise.reject(error);
					}
				}

				return Promise.reject(error);
			}
		);

		return () => {
			api.interceptors.response.eject(responseInterceptor);
		};
	}, []);

	/* ===== Login ===== */
	const login = async (
		email: string,
		password: string
	): Promise<LoginResult> => {
		try {
			const response = await api.post("/auth/login", {
				email,
				password,
			});

			const { accessToken, user } = response.data;

			setAccessToken(accessToken);
			setUser(user);

			return { success: true };
		} catch (err) {
			const error = err as AxiosError<{ message?: string }>;
			return {
				success: false,
				error: error.response?.data?.message || "Erro ao fazer login",
			};
		}
	};

	/* ===== Logout ===== */
	const logout = async () => {
		try {
			await api.post("/auth/logout");
		} catch {
			// backend falhou? problema dele
		} finally {
			setAccessToken(null);
			setUser(null);
		}
	};

	const value: AuthContextType = {
		user,
		loading,
		login,
		logout,
		getAccessToken,
		setAccessToken,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

/* ========= HOOK ========= */

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth deve ser usado dentro de AuthProvider");
	}

	return context;
}
