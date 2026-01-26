import "./styles/App.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUser } from "./Hooks/useUser";
import { useChat } from "./Hooks/useChat";
import { useAuth } from "./Contexts/AuthContext";
import { api } from "./auth/api";

function App() {
	const { setAccessToken, getAccessToken } = useAuth();
	const [logged, setLogged] = useState<boolean | null>(null);
	const route = useLocation();
	const reconnectInterval = useRef<null | number>(null);
	const navigate = useNavigate();
	const { Chats, setChats } = useChat();
	const { ws, setUser, user } = useUser();
	const host = import.meta.env.VITE_API_URL;
	const isConnecting = useRef(false);

	const connectTowebsocket = (id: number) => {
		if (isConnecting.current) return;

		// Fecha qualquer socket antigo
		if (ws.current) {
			ws.current.onclose = null;
			ws.current.close();
			ws.current = null;
		}

		isConnecting.current = true;

		const wsUrl = host.replace(/^http/, "ws") + `?userId=${id}`;
		ws.current = new WebSocket(wsUrl);

		ws.current.onopen = () => {
			console.log("websocket conectado");
			isConnecting.current = false;

			if (reconnectInterval.current) {
				clearInterval(reconnectInterval.current);
				reconnectInterval.current = null;
			}
		};

		ws.current.onmessage = (message) => {
			const data = JSON.parse(message.data);
			if (data.titulo === "newMsg") {
				delete data.titulo;

				if (!Chats.current) return;

				const tempChats = Chats.current.map((chat) =>
					chat.id === data.chat_id
						? { ...chat, msgs: [...chat.msgs, data] }
						: chat
				);

				setChats(tempChats);
			}
		};

		ws.current.onclose = () => {
			console.log("conexao caiu");
			isConnecting.current = false;

			if (reconnectInterval.current) return;

			reconnectInterval.current = window.setInterval(() => {
				console.log("tentando reconectar...");
				connectTowebsocket(id);
			}, 3000);
		};

		ws.current.onerror = () => {
			ws.current?.close();
		};
	};

	const mainRequest = async () => {
		console.log("main request");
		try {
			const response = await api.get(`${host}/api/auth/refresh/`);
			if (response.status === 200) {
				const data = response.data;
				setAccessToken(data.access_token);
				setUser(data.user);
				connectTowebsocket(data.user.id);

				if (route.pathname.length < 2) navigate("direct");
			}
		} catch (error) {
			console.log("Erro ao fazer a requisição:", error.response);
			navigate("login");
			// Aqui você pode decidir o que fazer em caso de erro, ex: mostrar mensagem ou navegar para login
		}
	};

	useEffect(() => {
		if (
			!["signin", "login", "signup"].includes(
				route.pathname.replace("/", "")
			) &&
			!getAccessToken()
		) {
			mainRequest();
		}

		return () => {
			if (reconnectInterval.current) {
				clearInterval(reconnectInterval.current);
				reconnectInterval.current = null;
			}

			if (ws.current) {
				ws.current.close();
				ws.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (!user?.id) return;
		connectTowebsocket(user.id);
	}, [logged]);

	return (
		<div className="relative">
			<Outlet context={setLogged} />
		</div>
	);
}

export default App;
