import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect } from "react";
import { useChat } from "./Hooks/useChat";
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
		isLoading,
		rejeitarPedido,
		aceitarPedido,
		cancelarPedido,
		loadRequests,
		clearRequests,
	} = useRequests();

	useEffect(() => {
		document.title = "Pedidos";
		setIsChatOpen(true);
		setOpenedChats("abcd");
		loadRequests();

		const handlePedidoUpdate = () => loadRequests();
		window.addEventListener("pedidoAdicionado", handlePedidoUpdate);
		window.addEventListener("pedidoRemovido", handlePedidoUpdate);

		return () => {
			window.removeEventListener("pedidoAdicionado", handlePedidoUpdate);
			window.removeEventListener("pedidoRemovido", handlePedidoUpdate);
			clearRequests();
			setIsChatOpen(false);
			setOpenedChats(null);
		};
	}, [setIsChatOpen, setOpenedChats, loadRequests, clearRequests]);

	const handleBack = () => {
		navigate("/direct");
		setIsChatOpen(false);
		setOpenedChats(null);
	};

	return (
		<div className="max-h-dvh flex flex-col fade pedidos">
			<RequestsHeader
				onBack={handleBack}
				title="Pedidos"
			/>

			{isLoading ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
				</div>
			) : (
				<div className="scroll-thin p-5 pr-2 flex-1 overflow-y-auto text-sm flex flex-col gap-6">
					<RequestList
						title="Recebidos"
						users={recebidos || []}
						type="recebido"
						onRejeitar={rejeitarPedido}
						onAceitar={aceitarPedido}
					/>

					<RequestList
						title="Enviados"
						users={enviados || []}
						type="enviado"
						onCancelar={cancelarPedido}
					/>
				</div>
			)}
		</div>
	);
}
