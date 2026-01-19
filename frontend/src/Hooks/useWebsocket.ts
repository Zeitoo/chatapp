import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebSocketOptions {
	onOpen?: () => void;
	onClose?: () => void;
	onMessage?: (event: MessageEvent) => void;
	onError?: (error: Event) => void;
	reconnect?: boolean;
	reconnectInterval?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
	console.log("Usewebsocket executado....");
	const [isConnected, setIsConnected] = useState(false);
	const ws = useRef<WebSocket | null>(null);
	const reconnectTimeout = useRef<NodeJS.Timeout>();

	const connect = useCallback(() => {
		ws.current = new WebSocket(url);

		ws.current.onopen = () => {
			setIsConnected(true);
			options.onOpen?.();
		};

		ws.current.onmessage = (event) => {
			options.onMessage?.(event);
		};

		ws.current.onerror = (error) => {
			options.onError?.(error);
		};

		ws.current.onclose = () => {
			setIsConnected(false);
			options.onClose?.();

			// Reconectar automaticamente se configurado
			if (options.reconnect) {
				reconnectTimeout.current = setTimeout(() => {
					connect();
				}, options.reconnectInterval || 3000);
			}
		};
	}, [url, options]);

	useEffect(() => {
		connect();

		return () => {
			reconnectTimeout.current && clearTimeout(reconnectTimeout.current);
			ws.current?.close();
		};
	}, [connect]);

	const sendMessage = useCallback((message: string | object) => {
		if (ws.current?.readyState === WebSocket.OPEN) {
			const data =
				typeof message === "string" ? message : JSON.stringify(message);
			ws.current.send(data);
		}
	}, []);

	return { isConnected, sendMessage };
}
