import { Request, Response } from "express";
import {
	getUsersByNameS,
	getUsers,
} from "../models/models";

export class UserController {
	static async searchByName(req: Request, res: Response) {
		// Extrai user_name como string (pode ser string ou string[])
		const user_name = req.params.user_name;
		const userName = Array.isArray(user_name) ? user_name[0] : user_name;

		if (!userName) {
			return res.status(400).json({ message: "user required" });
		}

		const users = await getUsersByNameS(userName);
		if (!users || users.length === 0) {
			return res.status(404).json({ message: "user not found" });
		}

		const userData = users.map((element) => {
			delete element.password_hash;
			return element;
		});

		return res.status(200).json(userData);
	}

	static async getUsersByIds(req: Request, res: Response) {
		const reqUsers: number[] = req.body.users;
		if (reqUsers && reqUsers.length > 0) {
			const users = await getUsers(reqUsers);
			return res.status(200).json(users);
		}

		return res.status(200).json({ message: "nenhum user encontrado..." });
	}
}
