import { createPool, Pool } from "mysql2/promise";
import dotenv from "dotenv";

export const pool: Pool = createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	port: Number(process.env.DB_PORT),
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: 10,
});
