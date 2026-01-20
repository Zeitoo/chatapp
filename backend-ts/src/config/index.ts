import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  lanAddress: process.env.LAN_HOST as string,
};