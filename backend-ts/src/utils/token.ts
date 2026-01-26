import jwt from "jsonwebtoken";
import { UserToken } from "../Types";
import crypto from "crypto";

export const generatAccessToken = (user: UserToken) => {
	if (process.env.AUTHORIZATION_SECRET) {
		return jwt.sign(user, process.env.AUTHORIZATION_SECRET, {
			expiresIn: "20m",
		});
	}
};

export const generateRefreshToken = () => {
	const refreshToken = crypto.randomBytes(32).toString("hex");
	return refreshToken;
};

export const generateToken = (ip: string): string => {
	const chars =
		"qweruiopasdfghj1234ty7890klzxcvbnm12347890QWERUIOPASDFGHJKLZXCVBNM";
	const randomString = Array.from(chars)
		.sort(() => Math.random() - 0.5)
		.join("")
		.slice(0, 10);

	const cleanIp = ip.replace(/[:.]/g, "").replace("ffff", "");

	return `${randomString}ty${cleanIp}`;
};

export const generateId = (): string => {
	const chars =
		"qweruiopasdfghj1234ty7890klzxcvbnm12347890QWERUIOPASDFGHJKLZXCVBNM";
	return Array.from(chars)
		.sort(() => Math.random() - 0.5)
		.join("")
		.slice(0, 36);
};
