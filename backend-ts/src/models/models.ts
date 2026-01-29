// models.ts
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../config/config_db";
import crypto from "crypto";
import { RefreshTokenWithUser } from "../Types";
import dotenv from "dotenv";

dotenv.config();

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
	id: string;
	tipo: string;
	criado_em: string;
	chat_name: string;
	profile_img: number;
}

/* Helpers */
async function query<T = RowDataPacket[]>(
	sql: string,
	params?: any[]
): Promise<T> {
	const [rows] = await pool.query<RowDataPacket[]>(sql, params);
	return rows as T;
}
/* Queries */

export const getChats = async (userId: number): Promise<Chat[]> => {
	const rows = await query<Chat[]>(
		`SELECT c.* FROM CHATS c
     WHERE c.id IN (SELECT chat_id FROM chat_users WHERE user_id = ?);`,
		[userId]
	);

	return rows;
};

export const getChatParticipants = async (
	chatId: string
): Promise<{ user_id: number }[]> => {
	const rows = await query<{ user_id: number }[]>(
		`SELECT user_id FROM chat_users WHERE chat_id = ?;`,
		[chatId]
	);

	return rows;
};

export const getChatMessages = async (chatId: string): Promise<Message[]> => {
	const rows = await query<Message[]>(
		`SELECT * FROM messages WHERE chat_id = ?;`,
		[chatId]
	);

	return rows;
};

export const getPrivateChatBetweenUsers = async (
	userId1: number,
	userId2: number
): Promise<{ chat_id: string } | null> => {
	const rows = await query<{ chat_id: string }[]>(
		`
		SELECT c.id AS chat_id
		FROM chats c
		JOIN chat_users cu ON cu.chat_id = c.id
		WHERE c.tipo = 'privado'
		  AND cu.user_id IN (?, ?)
		GROUP BY c.id
		HAVING COUNT(DISTINCT cu.user_id) = 2
		LIMIT 1;
		`,
		[userId1, userId2]
	);

	return rows.length > 0 ? rows[0] : null;
};

export const getUser = async (userId: number): Promise<User[]> => {
	const rows = await query<User[]>(`SELECT * FROM users WHERE id = ?;`, [
		userId,
	]);

	return rows;
};

export const getUsersIdByToken = async (
	token: string
): Promise<{ user_id: number }> => {
	const [rows] = await query<[{ user_id: number }]>(
		`SELECT user_id FROM tokens WHERE token = ?;`,
		[token]
	);

	return rows;
};

export const getUsersByEmail = async (email: string): Promise<User[]> => {
	const rows = await query<User[]>(
		`SELECT * FROM users WHERE email_address = ?;`,
		[email]
	);

	return rows;
};

export const getAccessToken = async (token: string): Promise<AnyRow[]> => {
	const rows = await query<AnyRow[]>(
		`SELECT * FROM tokens WHERE token = ?;`,
		[token]
	);

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

export const getPedido = async (
	pedido: string
): Promise<undefined | { fromto: string }> => {
	const [rows] = await query<[] | [{ fromto: string }]>(
		`SELECT * FROM pedidos WHERE fromto = ?;`,
		[pedido]
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

	return rows;
};

export const putRefreshToken = async (token_hash: string, userId: number) => {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	const connection = await pool.getConnection();

	await connection.beginTransaction();

	try {
		// 1. Revoga todas as refresh tokens do usuário
		await query(
			`UPDATE refresh_tokens
     SET revoked = true
     WHERE user_id = ? AND revoked = false`,
			[userId]
		);

		// 2. Insere o novo refresh token
		await query(
			`INSERT INTO refresh_tokens (user_id, token_hash, revoked, expires_at)
     VALUES (?, ?, false, ?)`,
			[userId, token_hash, expiresAt]
		);

		await connection.commit();

		return true;
	} catch (err) {
		await connection.rollback();
		return false;
		throw err;
	}
};

export const getRefreshToken = async (refreshToken: string) => {
	const refreshTokenHash = crypto
		.createHash("sha256")
		.update(refreshToken)
		.digest("hex");

	const [rows] = await pool.query<RefreshTokenWithUser[]>(
		`
    SELECT
      rt.id           AS refresh_id,
      rt.user_id,
      rt.token_hash,
      rt.revoked,
      rt.created_at   AS refresh_created_at,
      rt.expires_at,

      u.user_name,
      u.email_address,
      u.profile_img,
      u.created_at    AS user_created_at
    FROM refresh_tokens rt
    INNER JOIN users u ON u.id = rt.user_id
    WHERE rt.token_hash = ?
	${process.env.NODE_ENV === "development" ? "" : "AND rt.revoked = false"}
	
  
      AND rt.expires_at > NOW();
    `,
		[refreshTokenHash]
	);

	return rows.length ? rows[0] : null;
};

export const putUser = async (user: {
	userName: string;
	emailAddress: string;
	password: string;
	profileImg?: string | null;
}): Promise<boolean | null> => {
	try {
		const response = await query(
			`INSERT INTO users (user_name, email_address, password_hash, profile_img)
       VALUES (?, ?, ?, ?);`,
			[
				user.userName,
				user.emailAddress,
				user.password,
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
		console.log(e);
		return null;
	}
};

export const putMessage = async (messageData: {
	chatId: string;
	userId: number | string;
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
): Promise<AnyRow | null> => {
	const combined = `${remetente},${destinatario}`;

	try {
		const rows = await query<AnyRow[]>(
			`INSERT INTO pedidos (fromto) VALUES (?);`,
			[combined]
		);

		return rows;
	} catch (error: any) {
		return null;
	}
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
	const conn = await pool.getConnection();

	try {
		await conn.beginTransaction();

		const [chat] = (await conn.query(
			`INSERT INTO chats (id, tipo) VALUES (?, 'privado');`,
			[chatId]
		)) as any;

		if (chat.affectedRows < 1) throw new Error("Chat não criado");

		for (const userId of users) {
			const [cu] = (await conn.query(
				`INSERT INTO chat_users (chat_id, user_id) VALUES (?, ?);`,
				[chatId, userId]
			)) as any;

			if (cu.affectedRows < 1)
				throw new Error("Falha ao inserir usuário");
		}

		await conn.commit();
		return true;
	} catch (err) {
		await conn.rollback();
		return false;
	} finally {
		conn.release();
	}
};

/* ================= USERS ================= */

export const getUsersByIds = async (userIds: number[]) => {
	if (!userIds.length) return [];

	const placeholders = userIds.map(() => "?").join(",");
	return query(
		`SELECT id, user_name, profile_img
     FROM users
     WHERE id IN (${placeholders});`,
		userIds
	);
};

/* ================= CHATS ================= */

export const getChatsByUser = async (userId: number) => {
	return query(
		`SELECT c.*
     FROM chats c
     WHERE c.id IN (
       SELECT chat_id FROM chat_users WHERE user_id = ?
     );`,
		[userId]
	);
};

export const getChatUsersByChatIds = async (chatIds: string[]) => {
	if (!chatIds.length) return [];

	const placeholders = chatIds.map(() => "?").join(",");
	return query(
		`SELECT chat_id, user_id
     FROM chat_users
     WHERE chat_id IN (${placeholders});`,
		chatIds
	);
};

/* ================= MESSAGES ================= */

export const getMessagesByChatIds = async (chatIds: string[]) => {
	if (!chatIds.length) return [];

	const placeholders = chatIds.map(() => "?").join(",");
	return query(
		`SELECT * FROM messages WHERE chat_id IN (${placeholders}) ORDER BY enviado_em ASC;`,
		chatIds
	);
};
