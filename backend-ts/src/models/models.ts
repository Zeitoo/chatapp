// models.ts
import { pool } from "../config/config_db";
import crypto from "crypto";
import { RefreshTokenWithUser } from "../Types";
import { query } from "../utils/helpers";

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

export const getChats = async (userId: number): Promise<Chat[]> => {
	try {
		const rows = await query<Chat[]>(
			`SELECT c.* FROM CHATS c
			 WHERE c.id IN (SELECT chat_id FROM chat_users WHERE user_id = ?);`,
			[userId]
		);
		return rows;
	} catch (error) {
		console.error("Error in getChats:", error);
		return [];
	}
};

export const getChatParticipants = async (
	chatId: string
): Promise<{ user_id: number }[]> => {
	try {
		const rows = await query<{ user_id: number }[]>(
			`SELECT user_id FROM chat_users WHERE chat_id = ?;`,
			[chatId]
		);
		return rows;
	} catch (error) {
		console.error("Error in getChatParticipants:", error);
		return [];
	}
};

export const getChatMessages = async (chatId: string): Promise<Message[]> => {
	try {
		const rows = await query<Message[]>(
			`SELECT * FROM messages WHERE chat_id = ?;`,
			[chatId]
		);
		return rows;
	} catch (error) {
		console.error("Error in getChatMessages:", error);
		return [];
	}
};

export const getPrivateChatBetweenUsers = async (
	userId1: number,
	userId2: number
): Promise<{ chat_id: string } | null> => {
	try {
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
	} catch (error) {
		console.error("Error in getPrivateChatBetweenUsers:", error);
		return null;
	}
};

export const getUser = async (userId: number): Promise<User[]> => {
	try {
		const rows = await query<User[]>(`SELECT * FROM users WHERE id = ?;`, [
			userId,
		]);
		return rows;
	} catch (error) {
		console.error("Error in getUser:", error);
		return [];
	}
};

export const getUsersByEmail = async (email: string): Promise<User[]> => {
	try {
		const rows = await query<User[]>(
			`SELECT * FROM users WHERE email_address = ?;`,
			[email]
		);
		return rows;
	} catch (error) {
		console.error("Error in getUsersByEmail:", error);
		return [];
	}
};

export const getUsersByName = async (
	userName: string
): Promise<User[] | false> => {
	try {
		const rows = await query<User[]>(
			`SELECT * FROM users WHERE user_name LIKE ? LIMIT 20;`,
			[`%${userName}%`]
		);
		return !rows || rows.length === 0 ? false : rows;
	} catch (error) {
		console.error("Error in getUsersByName:", error);
		return false;
	}
};

export const getUsers = async (users: number[]): Promise<User[]> => {
	try {
		if (!users || users.length === 0) return [];
		const placeholders = users.map(() => "?").join(",");
		const rows = await query<User[]>(
			`SELECT * FROM users WHERE id IN (${placeholders});`,
			users
		);
		return rows;
	} catch (error) {
		console.error("Error in getUsers:", error);
		return [];
	}
};

export const getPedidos = async (
	userId: number | string
): Promise<AnyRow[]> => {
	try {
		const rows = await query<AnyRow[]>(
			`SELECT * FROM pedidos WHERE fromto LIKE ?;`,
			[`%${userId}%`]
		);
		return rows;
	} catch (error) {
		console.error("Error in getPedidos:", error);
		return [];
	}
};

export const getPedido = async (
	pedido: string
): Promise<undefined | { fromto: string }> => {
	try {
		const [rows] = await query<[] | [{ fromto: string }]>(
			`SELECT * FROM pedidos WHERE fromto = ?;`,
			[pedido]
		);
		return rows;
	} catch (error) {
		console.error("Error in getPedido:", error);
		return undefined;
	}
};

export const putRefreshToken = async (
	token_hash: string,
	userId: number
): Promise<boolean> => {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	const connection = await pool.getConnection();

	try {
		await connection.beginTransaction();

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
	} catch (error) {
		await connection.rollback();
		console.error("Error in putRefreshToken:", error);
		return false;
	} finally {
		connection.release();
	}
};

export const getRefreshToken = async (
	refreshToken: string
): Promise<RefreshTokenWithUser | null> => {
	try {
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
	} catch (error) {
		console.error("Error in getRefreshToken:", error);
		return null;
	}
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
				user.password,
				user.profileImg ?? null,
			]
		);
		return true;
	} catch (error: any) {
		if (
			typeof error?.message === "string" &&
			error.message.includes("Duplicate entry")
		) {
			return null;
		}
		console.error("Error in putUser:", error);
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
	} catch (error) {
		console.error("Error in putMessage:", error);
		return null;
	}
};

export const putPedido = async (
	remetente: string,
	destinatario: string
): Promise<AnyRow | null> => {
	try {
		const combined = `${remetente},${destinatario}`;
		const rows = await query<AnyRow[]>(
			`INSERT INTO pedidos (fromto) VALUES (?);`,
			[combined]
		);
		return rows;
	} catch (error) {
		console.error("Error in putPedido:", error);
		return null;
	}
};

export const deletePedido = async (pedido: string): Promise<boolean> => {
	try {
		const rows = await query<AnyRow[]>(
			`DELETE FROM pedidos WHERE fromto = ?;`,
			[pedido]
		);
		const affected =
			(rows as any)?.affectedRows ?? (rows as any)[0]?.affectedRows ?? 0;
		return affected > 0;
	} catch (error) {
		console.error("Error in deletePedido:", error);
		return false;
	}
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
	} catch (error) {
		await conn.rollback();
		console.error("Error in putNewChat:", error);
		return false;
	} finally {
		conn.release();
	}
};

export const getUsersByIds = async (userIds: number[]): Promise<AnyRow[]> => {
	try {
		if (!userIds.length) return [];
		const placeholders = userIds.map(() => "?").join(",");
		return await query(
			`SELECT id, user_name, profile_img
			 FROM users
			 WHERE id IN (${placeholders});`,
			userIds
		);
	} catch (error) {
		console.error("Error in getUsersByIds:", error);
		return [];
	}
};

export const getChatsByUser = async (userId: number): Promise<AnyRow[]> => {
	try {
		return await query(
			`SELECT c.*
			 FROM chats c
			 WHERE c.id IN (
			   SELECT chat_id FROM chat_users WHERE user_id = ?
			 );`,
			[userId]
		);
	} catch (error) {
		console.error("Error in getChatsByUser:", error);
		return [];
	}
};

export const getChatUsersByChatIds = async (
	chatIds: string[]
): Promise<AnyRow[]> => {
	try {
		if (!chatIds.length) return [];
		const placeholders = chatIds.map(() => "?").join(",");
		return await query(
			`SELECT chat_id, user_id
			 FROM chat_users
			 WHERE chat_id IN (${placeholders});`,
			chatIds
		);
	} catch (error) {
		console.error("Error in getChatUsersByChatIds:", error);
		return [];
	}
};

export const getMessagesByChatIds = async (
	chatIds: string[]
): Promise<AnyRow[]> => {
	try {
		if (!chatIds.length) return [];
		const placeholders = chatIds.map(() => "?").join(",");
		return await query(
			`SELECT * FROM messages WHERE chat_id IN (${placeholders}) ORDER BY enviado_em ASC;`,
			chatIds
		);
	} catch (error) {
		console.error("Error in getMessagesByChatIds:", error);
		return [];
	}
};
