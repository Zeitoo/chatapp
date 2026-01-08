//models.js
const { pool } = require("../config/config_db.js");

function fecharPool() {
	setTimeout(() => {
		//pool.end();
	}, 20000);
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

const getUsers = async (userId) => {
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
	const [rows] = await pool.query(
		`SELECT * FROM users WHERE user_name = "${userName}";`
	);

	return rows[0];
};

const putAccessToken = async (token, userId) => {
	const [rows] = await pool.query(
		`INSERT INTO tokens (token, user_id) VALUES ("${token}", ${userId});`
	);
	fecharPool();
	return rows;
};

module.exports = {
	getChats,
	getChatParticipants,
	getChatMessages,
	getUsers,
	getUsersByEmail,
	getAccessToken,
	putAccessToken,
	getUsersByToken,
	getUsersByName
};
