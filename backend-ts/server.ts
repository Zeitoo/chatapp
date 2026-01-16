import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import cookieParser from "cookie-parser";

import {
	getChats,
	getChatParticipants,
	getChatMessages,
	getUser,
	getUsersByEmail,
	putAccessToken,
	getAccessToken,
	getUsersByToken,
	getUsersByNameS,
	putUser,
	putMessage,
	getPedidos,
	getUsers,
	deletePedido,
	putNewChat,
} from "./models/models";

dotenv.config();

const app = express();
const port = 3000;
const lanAddress = process.env.LAN_HOST as string;

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

/* ================= Utils ================= */

const token = (ip: string): string => {
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

const generateId = (): string => {
	return Array.from(
		"qweruiopasdfghj1234ty7890klzxcvbnm12347890QWERUIOPASDFGHJKLZXCVBNM"
	)
		.sort(() => Math.random() - 0.5)
		.join("")
		.slice(0, 36);
};

function hashPassword(password: string): string {
	return crypto.createHash("sha256").update(password).digest("hex");
}

function hashCompare(hash1: string, hash2: string): boolean {
	return hash1 === hash2;
}

/* ================= Middleware ================= */

async function verifyAuth(req: Request, res: Response, next: NextFunction) {
	const ip =
		req.socket.remoteAddress?.replace(/[:.]/g, "").replace("ffff", "") ??
		"";

	const accessToken = req.cookies?.access_token as string | undefined;

	if (!accessToken) {
		return res.status(401).json({ message: "Login required..." });
	}

	try {
		const tokenData = await getAccessToken(accessToken);

		if (tokenData.length > 0 && tokenData[0].token.split("ty")[1] === ip) {
			return next();
		}
	} catch (err) {
		console.error(err);
	}

	res.cookie("access_token", "", {
		httpOnly: true,
		maxAge: 1000 * 2,
		secure: false,
	});

	return res.status(401).json({ message: "Login required..." });
}

/* ================= Helpers ================= */

async function chats(userId: number) {
	const chats = await getChats(userId);

	await Promise.all(
		chats.map(async (chat: any) => {
			const [msgs, participants] = await Promise.all([
				getChatMessages(chat.id),
				getChatParticipants(chat.id),
			]);

			chat.msgs = msgs;

			if (chat.tipo === "privado") {
				const otherUser = participants.find(
					(u: any) => u.user_id !== userId
				);

				if (!otherUser) return;

				const userData = await getUser(otherUser.user_id);
				const user = userData[0];
				if (!user) return;

				chat.chat_name = user.user_name;
				chat.profile_img = user.profile_img;
				chat.participants = [user];
				return;
			}

			const participantsData = await Promise.all(
				participants.map(async (p: any) => {
					const userData = await getUser(p.user_id);
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

/* ================= Routes ================= */

app.get("/", (_req: Request, res: Response) => {
	res.end("hi");
});

app.get("/status", verifyAuth, async (req: Request, res: Response) => {
	const accessToken = req.cookies?.access_token as string;

	const user = await getUsersByToken(accessToken);
	if (user[0]?.id) {
		const response = await getPedidos(user[0].id);

		const pedidos: string[][] = [];

		for (const c of response) {
			const pedido = c.fromto.split(",");
			if (pedido.includes(String(user[0].id))) pedidos.push(pedido);
		}

		user[0].pedidos = pedidos;
		return res.status(200).json(user);
	}
});

app.post("/chats", async (req: Request, res: Response) => {
	const user = req.body;

	if (user?.id) {
		const chatsWithMsgs = await chats(user.id);
		return res.status(200).json(chatsWithMsgs);
	}

	return res.json({ message: "failed" });
});

app.post("/login", async (req: Request, res: Response) => {
	const ip = req.socket.remoteAddress ?? "";
	const { email, password } = req.body;

	const users = await getUsersByEmail(email);
	if (!users || users.length === 0) {
		return res.status(401).json({ message: "Credenciais inválidas." });
	}

	const user = users[0];

	if (!hashCompare(hashPassword(password), user.password_hash)) {
		return res.status(401).json({ message: "Credenciais inválidas." });
	}

	delete user.password_hash;

	const accessToken = token(ip);
	await putAccessToken(accessToken, user.id);

	res.cookie("access_token", accessToken, {
		httpOnly: true,
		maxAge: 1000 * 60 * 600,
		secure: false,
	});

	return res.status(200).json({
		message: "Login feito com sucesso.",
		user,
	});
});

app.post("/signup", async (req: Request, res: Response) => {
	const user = req.body;
	const estado = await putUser(user);

	if (estado) {
		return res.status(201).json({ message: "signup successful" });
	}

	return res.status(409).json({ message: "user already exists" });
});

app.get("/user/search/:user_name", async (req: Request, res: Response) => {
	const user_name = req.params.user_name;

	if (!user_name) {
		return res.status(400).json({ message: "user required" });
	}

	const user = await getUsersByNameS(user_name[0]);
	if (!user) {
		return res.status(404).json({ message: "user not found" });
	}

	delete user[0].password_hash;
	return res.status(200).json(user[0]);
});

app.post("/users", async (req: Request, res: Response) => {
	const reqUsers: number[] = req.body.users;

	if (reqUsers.length > 0) {
		const users = await getUsers(reqUsers);
		return res.status(200).json(users);
	}

	return res.status(200).json({ message: "nenhum user encontrado..." });
});

app.put("/new_msg", async (req: Request, res: Response) => {
	const { chatId, conteudo, userId } = req.body;

	await putMessage({ chatId, conteudo, userId });
	return res.status(200).send("done");
});

app.put("/new_chat", async (req: Request, res: Response) => {
	const users: number[] = req.body.users;
	const response = await putNewChat(generateId(), users);

	if (!response) {
		return res.status(400).json({
			message: "Houve um erro na criacao do chat...",
		});
	}

	const pedido = users.join(",");
	const rows = await deletePedido(pedido);

	if (rows) {
		return res.status(200).json({
			message: "Chat criado com sucesso",
		});
	}

	return res.status(400).json({
		message: "Houve um erro na criacao do chat...",
	});
});

app.delete("/pedido", async (req: Request, res: Response) => {
	const pedido = req.body.pedido;
	const response = await deletePedido(pedido);

	if (response) {
		return res.status(200).json({ message: "Apagado com sucesso." });
	}

	return res.status(404).json({ message: "Pedido não encontrado." });
});
