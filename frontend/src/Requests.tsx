// Requests.tsx
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useCallback } from "react";
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

  const handleBack = () => {
    navigate("/direct");
    setIsChatOpen(false);
    setOpenedChats(null);
  };

  // ⭐ ATUALIZE: Carregue pedidos quando o componente montar
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // ⭐ CORRIJA: Listener para atualizações em tempo real
  const handlePedidoUpdate = useCallback(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    setIsChatOpen(true);
    setOpenedChats("abcd");

    // ⭐ ADICIONE: Event listeners para atualizações em tempo real
    window.addEventListener("pedidoAdicionado", handlePedidoUpdate);
    window.addEventListener("pedidoRemovido", handlePedidoUpdate);

    return () => {
      window.removeEventListener("pedidoAdicionado", handlePedidoUpdate);
      window.removeEventListener("pedidoRemovido", handlePedidoUpdate);
      clearRequests();
    };
  }, [setIsChatOpen, setOpenedChats, handlePedidoUpdate, clearRequests]);

  useEffect(() => {
    document.title = "Pedidos";
  }, []);

  return (
    <div className="max-h-dvh flex flex-col fade pedidos">
      <RequestsHeader
        onBack={handleBack}
        title="Pedidos"
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : (
        <div className="scroll-thin p-5 pr-2 flex-1 overflow-y-auto text-sm flex flex-col gap-4">
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