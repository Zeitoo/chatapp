import { CorsOptions } from 'cors';
import { config } from './env';

// Configurações de CORS (Cross-Origin Resource Sharing)
// Define quais origens podem acessar a API
export const corsOptions: CorsOptions = {
  origin: config.lanAddress,  // Apenas endereços da LAN
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'],  // Headers permitidos
  credentials: true,  // Permite envio de cookies
};