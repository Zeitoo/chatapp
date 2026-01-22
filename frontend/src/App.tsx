import "./styles/App.css";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUser } from "./Hooks/useUser";
import { useChat } from "./Hooks/useChat";

function App() {
	const navigate = useNavigate();
	const route = useLocation();
	const reconnectInterval = useRef<null | number>(null);
	const [logged, setLogged] = useState<boolean>(false);

	const { Chats, setChats } = useChat();
	const { ws, setUser } = useUser();
	const host = import.meta.env.VITE_API_URL;

	const connectTowebsocket = (id: number) => {
		if (ws.current?.readyState === WebSocket.OPEN) return;

		ws.current = new WebSocket(
			host.replace("http", "ws") + `?userId=${id}`
		);

		ws.current.onopen = () => {
			console.log("websocket conectado");

			if (reconnectInterval.current) {
				clearInterval(reconnectInterval.current);
				reconnectInterval.current = null;
			}
		};

		ws.current.onmessage = (message) => {
			const data = JSON.parse(message.data);
			console.log(data)
			if (data.titulo === "newMsg") {
				delete data.titulo;
				const tempChats = [];
				let tempChat;
				if (!Chats.current) return;
				//Procurar o chat a ser editado
				for (let chat of Chats?.current) {
					if (chat.id === data.chat_id) {
						tempChat = chat;

						tempChat?.msgs.push(data);
						tempChats.push(tempChat);
					} else {
						tempChats.push(chat);
					}
				}

				setChats(tempChats);
			}
		};

		ws.current.onclose = () => {
			console.log("conexao caiu");

			if (reconnectInterval.current) return;

			reconnectInterval.current = setInterval(() => {
				console.log("tentando reconectar...");
				connectTowebsocket(id);
			}, 3000);
		};
	};

	useEffect(() => {
		if (!route.pathname.includes("sign") || logged) {
			fetch(`${host}/api/users/status/`, { credentials: "include" }).then(
				(res) => {
					if (res.status !== 200) {
						navigate("/signin");
					} else {
						res.json().then((data) => {
							connectTowebsocket(data[0].id);
							setUser(data[0]);
						});

						if (route.pathname === "/") {
							navigate("/direct");
						}
					}
				}
			);
		}

		return () => {
			if (ws.current) ws.current.close();
			if (reconnectInterval.current)
				clearInterval(reconnectInterval.current);
		};
	}, [logged]);

	return (
		<div className="relative">
			<Outlet context={setLogged} />
		</div>
	);
}

export default App;
