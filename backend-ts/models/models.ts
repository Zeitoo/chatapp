// models.ts
import type { Pool } from "mysql2/promise";

import { pool } from "../config/config_db";

import crypto from "crypto";

type AnyRow = Record<string, any>;

export interface User {
	id?: number;
	user_name?: string;
	email_address?: string;
	password_hash?: string;
	profile_img?: string | null;
	[k: string]: any;
}

export interface Message {
	id?: number;
	chat_id?: string;
	user_id?: number;
	conteudo?: string;
	created_at?: string;
	[k: string]: any;
}

export interface Chat {
	id?: string;
	tipo?: string;
	[k: string]: any;
}

function fecharPool() {
	// Mantive a tua ideia original — só que não fazer pool.end() aqui
	// porque isso fecha o pool para todo o resto da app.
	setTimeout(() => {
		// pool.end();
	}, 20000);
}

function hashPassword(password: string) {
	return crypto.createHash("sha256").update(password).digest("hex");
}

/* Helpers */
async function query<T = AnyRow[]>(sql: string, params?: any[]) {
	// wrapper para tipar e centralizar chamadas
	const [rows] = await pool.query<T & AnyRow[]>(sql, params);
	return rows as unknown as T;
}

/* Queries */

export const getChats = async (userId: number): Promise<Chat[]> => {
	const rows = await query<Chat[]>(
		`SELECT c.* FROM CHATS c
     WHERE c.id IN (SELECT chat_id FROM chat_users WHERE user_id = ?);`,
		[userId]
	);

	fecharPool();
	return rows;
};

export const getChatParticipants = async (
	chatId: string
): Promise<{ user_id: number }[]> => {
	const rows = await query<{ user_id: number }[]>(
		`SELECT user_id FROM chat_users WHERE chat_id = ?;`,
		[chatId]
	);

	fecharPool();
	return rows;
};

export const getChatMessages = async (chatId: string): Promise<Message[]> => {
	const rows = await query<Message[]>(
		`SELECT * FROM messages WHERE chat_id = ?;`,
		[chatId]
	);

	fecharPool();
	return rows;
};

export const getUser = async (userId: number): Promise<User[]> => {
	const rows = await query<User[]>(`SELECT * FROM users WHERE id = ?;`, [
		userId,
	]);

	fecharPool();
	return rows;
};

export const getUsersByToken = async (token: string): Promise<User[]> => {
	const rows = await query<User[]>(
		`SELECT u.* FROM users u
     WHERE u.id = (SELECT user_id FROM tokens WHERE token = ?);`,
		[token]
	);

	fecharPool();
	return rows;
};

export const getUsersByEmail = async (email: string): Promise<User[]> => {
	const rows = await query<User[]>(
		`SELECT * FROM users WHERE email_address = ?;`,
		[email]
	);

	fecharPool();
	return rows;
};

export const getAccessToken = async (token: string): Promise<AnyRow[]> => {
	const rows = await query<AnyRow[]>(
		`SELECT * FROM tokens WHERE token = ?;`,
		[token]
	);

	fecharPool();
	return rows;
};

export const getUsersByName = async (
	userName: string
): Promise<User[] | false> => {
	const rows = await query<User[]>(
		`SELECT * FROM users WHERE user_name = ?;`,
		[userName]
	);

	if (!rows || rows.length === 0) return false;
	return rows;
};

export const getUsersByNameS = async (
	userName: string
): Promise<User[] | false> => {
	const rows = await query<User[]>(
		`SELECT * FROM users WHERE user_name LIKE ? LIMIT 20;`,
		[`%${userName}%`]
	);

	if (!rows || rows.length === 0) return false;
	return rows;
};

export const getUsers = async (users: number[]): Promise<User[]> => {
	if (!users || users.length === 0) return [];
	// Criar placeholders seguros
	const placeholders = users.map(() => "?").join(",");
	const rows = await query<User[]>(
		`SELECT * FROM users WHERE id IN (${placeholders});`,
		users
	);

	return rows;
};

export const getPedidos = async (
	userId: number | string
): Promise<AnyRow[]> => {
	const rows = await query<AnyRow[]>(
		`SELECT * FROM pedidos WHERE fromto LIKE ?;`,
		[`%${userId}%`]
	);

	return rows;
};

export const putAccessToken = async (
	token: string,
	userId: number
): Promise<AnyRow> => {
	const rows = await query<AnyRow[]>(
		`INSERT INTO tokens (token, user_id) VALUES (?, ?);`,
		[token, userId]
	);

	fecharPool();
	return rows;
};

export const putUser = async (user: {
	userName: string;
	emailAddress: string;
	password: string;
	profileImg?: string | null;
}): Promise<boolean | null> => {
	try {
		await query(
			`INSERT INTO users (user_name, email_address, password_hash, profile_img)
       VALUES (?, ?, ?, ?);`,
			[
				user.userName,
				user.emailAddress,
				hashPassword(user.password),
				user.profileImg ?? null,
			]
		);

		return true;
	} catch (e: any) {
		if (
			typeof e?.message === "string" &&
			e.message.includes("Duplicate entry")
		) {
			return null;
		}
		throw e;
	}
};

export const putMessage = async (messageData: {
	chatId: string;
	userId: number;
	conteudo: string;
}): Promise<AnyRow | null> => {
	try {
		const rows = await query<AnyRow[]>(
			`INSERT INTO messages (chat_id, user_id, conteudo) VALUES (?, ?, ?);`,
			[messageData.chatId, messageData.userId, messageData.conteudo]
		);

		return rows;
	} catch (e) {
		return null;
	}
};

export const putPedido = async (
	remetente: string,
	destinatario: string
): Promise<AnyRow> => {
	const combined = `${remetente},${destinatario}`;
	const rows = await query<AnyRow[]>(
		`INSERT INTO pedidos (fromto) VALUES (?);`,
		[combined]
	);

	return rows;
};

export const deletePedido = async (pedido: string): Promise<boolean> => {
	const rows = await query<AnyRow[]>(
		`DELETE FROM pedidos WHERE fromto = ?;`,
		[pedido]
	);

	// dependendo do driver rows pode ser um OkPacket, aqui verificamos affectedRows
	const affected =
		(rows as any)?.affectedRows ?? (rows as any)[0]?.affectedRows ?? 0;
	return affected > 0;
};

export const putNewChat = async (
	chatId: string,
	users: number[]
): Promise<boolean> => {
	const [createChat] = (await pool.query(
		`INSERT INTO chats (id, tipo) VALUES (?, "privado");`,
		[chatId]
	)) as any;

	if (createChat.affectedRows > 0) {
		for (const user of users) {
			const [createChatUsers] = (await pool.query(
				`INSERT INTO chat_users (chat_id, user_id) VALUES (?, ?);`,
				[chatId, user]
			)) as any;
			if (createChatUsers.affectedRows < 1) {
				return false;
			}
		}
		return true;
	} else {
		return false;
	}
};

/* Default export para compatibilidade com código CommonJS antigo */
export default {
	putPedido,
	putNewChat,
	deletePedido,
	getPedidos,
	getUsers,
	putUser,
	getChats,
	getChatParticipants,
	getChatMessages,
	getUser,
	getUsersByEmail,
	getAccessToken,
	putAccessToken,
	getUsersByToken,
	getUsersByName,
	getUsersByNameS,
	putMessage,
};
