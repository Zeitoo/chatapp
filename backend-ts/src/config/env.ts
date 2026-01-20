import dotenv from 'dotenv';

// Carrega variáveis do arquivo .env para process.env
dotenv.config();

// Exporta configurações centralizadas para uso em toda a aplicação
export const config = {
  port: process.env.PORT || 3000,  // Porta do servidor, padrão 3000
  lanAddress: process.env.LAN_HOST as string,  // Endereço permitido para CORS
  // Pode adicionar mais configurações conforme necessário
};