// Requests.tsx
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { useChat } from "./useChat";
import { useRequests } from "./Hooks/UseRequests";
import { RequestsHeader } from "./Components/Requests/Header";
import { RequestList } from "./Components/Requests/RequestList";
import type { ChatContextType } from "./Types";

export function Requests() {
	const navigate = useNavigate();
	const { setOpenedChats } = useOutletContext<ChatContextType>();
	const { setIsChatOpen } = useChat();
	const {
		recebidos,
		enviados,
		rejeitarPedido,
		aceitarPedido,
		cancelarPedido,
		loadRequests,
	} = useRequests();

	const handleBack = () => {
		navigate("/direct");
		setIsChatOpen(false);
		setOpenedChats(null);
	};

	useEffect(() => {
		loadRequests();
		setIsChatOpen(true);
		setOpenedChats("abcd");
	}, [loadRequests, setIsChatOpen, setOpenedChats]);

	return (
		<div className="max-h-dvh flex flex-col fade pedidos">
			<RequestsHeader 
				onBack={handleBack} 
				title="Pedidos" 
			/>
			
			<div className="scroll-thin p-5 pr-2 flex-1 overflow-y-auto text-sm flex flex-col gap-4">
				<RequestList
					title="Recebidos"
					users={recebidos}
					type="recebido"
					onRejeitar={rejeitarPedido}
					onAceitar={aceitarPedido}
				/>
				
				<RequestList
					title="Enviados"
					users={enviados}
					type="enviado"
					onCancelar={cancelarPedido}
				/>
			</div>
		</div>
	);
}