// components/ChatNotFound.tsx
import { Link } from "react-router-dom";

export function ChatNotFound() {
	return (
		<div className="h-dvh flex items-center justify-center flex-col">
			<h1 className="font-bold text-2xl mb-5">
				404. Chat não encontrado
			</h1>
			<Link to="/direct" className="text-blue-500 hover:underline">
				Clique aqui para voltar
			</Link>
		</div>
	);
}