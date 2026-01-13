//models.js
const { get } = require("http");
const { pool } = require("../config/config_db.js");
const crypto = require("crypto");

function fecharPool() {
	setTimeout(() => {
		//pool.end();
	}, 20000);
}
function hashPassword(password) {
	return crypto.createHash("sha256").update(password).digest("hex");
}

const getChats = async (userId) => {
	const [rows] = await pool.query(
		`SELECT * FROM CHATS WHERE id in (SELECT chat_id FROM chat_users WHERE user_id = ${userId});`
	);

	fecharPool();

	return rows;
};

const getChatParticipants = async (chatId) => {
	const [rows] = await pool.query(
		`SELECT user_id FROM chat_users WHERE chat_id = "${chatId}";`
	);

	fecharPool();

	return rows;
};

const getChatMessages = async (chatId) => {
	const [rows] = await pool.query(
		`SELECT * FROM messages WHERE chat_id = "${chatId}";`
	);

	fecharPool();

	return rows;
};

const getUser = async (userId) => {
	const [rows] = await pool.query(
		`SELECT * FROM users WHERE id = ${userId};`
	);

	fecharPool();
	return rows;
};

const getUsersByToken = async (token) => {
	const [rows] = await pool.query(
		`SELECT * FROM users WHERE id = (SELECT user_id FROM tokens WHERE token = "${token}");`
	);

	fecharPool();
	return rows;
};

const getUsersByEmail = async (email) => {
	const [rows] = await pool.query(
		`SELECT * FROM users WHERE email_address = "${email}";`
	);

	fecharPool();
	return rows;
};

const getAccessToken = async (userId) => {
	const [rows] = await pool.query(
		`SELECT * FROM tokens WHERE token = "${userId}"`
	);

	fecharPool();
	return rows;
};

const getUsersByName = async (userName) => {
	const rows = await pool.query(
		`SELECT * FROM users WHERE user_name = "${userName}";`
	);

	if (rows[0].length === 0) return false
	return rows;
};

const getUsersByNameS = async (userName) => {
	const rows = await pool.query(
		`SELECT * FROM users WHERE user_name LIKE "%${userName}%" LIMIT 20;`
	);

	if (rows[0].length === 0) return false
	return rows;
};

const getUsers = async (users) => {
	const query = `SELECT * FROM users WHERE id IN (${users.join(",")});`
	const [rows] = await pool.query(query)

	return rows
}

const getPedidos = async (userId) => {
	const [rows] = await pool.query(`SELECT * FROM pedidos WHERE fromto LIKE "%${userId}%";`)

	return rows
}

const putAccessToken = async (token, userId) => {
	const [rows] = await pool.query(
		`INSERT INTO tokens (token, user_id) VALUES ("${token}", ${userId});`
	);
	fecharPool();
	return rows;
};

const putUser = async (user) => {
	try {
		const rows = await pool.query(
			`INSERT INTO users (user_name, email_address, password_hash,profile_img) VALUES ("${user.userName
			}","${user.emailAddress}","${hashPassword(user.password)}",${user.profileImg
			});`
		);

		return true;
	} catch (e) {
		if (e.message.includes("Duplicate entry")) {
			return null;
		}
	}

	return true;
};

const putMessage = async (messageData) => {
	try {
		const [rows] = await pool.query(
			`INSERT INTO messages (chat_id, user_id, conteudo) VALUES ("${messageData.chatId}",${messageData.userId},"${messageData.conteudo}");`
		);

		return rows
	}
	catch (e) {
		return null
	}

}

const putPedido = async (remetente, destinatario) => {
	const rows = await pool.query(`INSERT INTO pedidos VALUES ("${remetente},${destinatario}");`)

	return rows
}

const deletePedido = async (pedido) => {
	const [rows] = await pool.query(`DELETE FROM pedidos WHERE fromto = "${pedido}";`)

	if (rows.affectedRows > 0) {
		return true
	}

	else {
		return false
	}
}

const putNewChat = async (chatId, users) => {

	const [createChat] = await pool.query(`INSERT INTO chats (id, tipo) VALUES ("${chatId}", "privado");`)
	if (createChat.affectedRows > 0) {
		for (let user of users) {
			const [createChatUsers] = await pool.query(`INSERT INTO chat_users VALUES ("${chatId}", ${user});`)
			if (createChatUsers.affectedRows < 1) {
				return false
			}
		}
		return true
	}
	else {
		return false
	}

}

module.exports = {
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
	putMessage
};
