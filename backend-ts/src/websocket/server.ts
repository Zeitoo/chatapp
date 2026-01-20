import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { handleWebSocketConnection } from './handlers';

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', handleWebSocketConnection);

  wss.on('error', (error) => {
    console.error('Erro no servidor WebSocket:', error);
  });

  console.log('WebSocket Server inicializado');

  return wss;
}