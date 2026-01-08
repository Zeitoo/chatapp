const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const port = 3000;
dotenv.config();
const lanAddress = process.env.LAN_HOST;

const {
	getChats,
	getDatabases,
	getChatParticipants,
	getChatMessages,
	getUsers,
	getUsersByEmail,
	putAccessToken,
	getAccessToken,
	getUsersByToken,
	getUsersByName,
} = require("./models/models.js");

app.use(express.json());
app.use(
	cors({
		origin: lanAddress,
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);
app.use(cookieParser());
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});

const token = (ip) => {
	return (
		Array.from(
			"qweruiopasdfghj1234ty7890klzxcvbnm12347890QWERUIOPASDFGHJKLZXCVBNM"
		)
			.sort(() => Math.random() - 0.5)
			.join("")
			.slice(0, 10) +
		"ty" +
		ip.replace(/[:.]/g, "").replace("ffff", "")
	);
};

function hashPassword(password) {
	return crypto.createHash("sha256").update(password).digest("hex");
}

function hashCompare(hash1, hash2) {
	return hash1 == hash2;
}

async function verifyAuth(req, res, next) {
	const ip = req.socket.remoteAddress
		.replace(/[:.]/g, "")
		.replace("ffff", "");

	const token = req.cookies?.access_token;
	//console.log("Verifying token:", token, "from IP:", ip);

	if (!token) {
		console.log("login required");
		return res.status(401).json({
			message: "Login required...",
		});
	}

	try {
		const tokenData = await getAccessToken(token);

		if (tokenData.length > 0 && tokenData[0].token.split("ty")[1] === ip) {
			return next(); // autorizado
		}
	} catch (err) {
		console.error(err);
	}

	// token inválido
	res.cookie("access_token", "", {
		httpOnly: true,
		maxAge: 1000 * 2,
		secure: false,
	});

	return res.status(401).json({
		message: "Login required...",
	});
}

async function chats(userId) {
	const chats = await getChats(userId);

	await Promise.all(
		chats.map(async (chat) => {
			// buscar mensagens e participantes em paralelo
			const [msgs, participants] = await Promise.all([
				getChatMessages(chat.id),
				getChatParticipants(chat.id),
			]);

			chat.msgs = msgs;

			// chat privado
			if (chat.tipo === "privado") {
				const otherUser = participants.find(
					(u) => u.user_id !== userId
				);

				if (!otherUser) return;

				const userData = await getUsers(otherUser.user_id);
				const user = userData[0];

				if (!user) return;

				chat.chat_name = user.user_name;
				chat.profile_img = user.profile_img;
				chat.participants = [user];
				return;
			}

			// chat de grupo
			const participantsData = await Promise.all(
				participants.map(async (p) => {
					const userData = await getUsers(p.user_id);
					const user = userData[0];
					if (!user) return null;
					delete user.password_hash;
					return user;
				})
			);

			chat.participants = participantsData.filter(Boolean);
		})
	);

	return chats;
}

app.post("/login", async (req, res) => {
	const ip = req.socket.remoteAddress;
	const { email, password } = req.body;

	let users = await getUsersByEmail(email);
	if (!users || users.length === 0) {
		return res.status(401).json({ message: "Credenciais inválidas." });
	}

	const user = users[0];

	if (!hashCompare(hashPassword(password), user.password_hash)) {
		return res.status(401).json({ message: "Credenciais inválidas." });
	}

	delete user.password_hash;

	const access_token = token(ip);

	putAccessToken(access_token, user.id);

	res.cookie("access_token", access_token, {
		httpOnly: true,
		maxAge: 1000 * 60 * 600,
		secure: false,
	});

	return res.status(200).json({
		message: "Login feito com sucesso.",
		user: user,
	});
});

app.get("/", (req, res) => {
	res.end("hi");
	//console.log(req.headers, req.cookies.access_token);
});

app.get("/status", verifyAuth, async (req, res) => {
	const token = req.cookies?.access_token;

	const user = await getUsersByToken(token);
	return res.status(200).json(user);
});

app.post("/chats", async (req, res) => {
	const user = req.body;
	if (user.id) {
		const chatsWithMsgs = await chats(user.id);
		res.status(200).json(chatsWithMsgs);
	} else {
		res.json({
			message: "failed",
		});
	}
});

app.post("/user", async (req, res) => {
	const userName = req?.body.user_name;

	if (userName) {
		const user = await getUsersByName(userName);
		return res.status(200).json(user);
	}
});
