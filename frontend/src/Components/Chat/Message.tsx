// components/MessageItem.tsx
import type { Msg, User } from "../../Types";

interface MessageItemProps {
	msg: Msg;
	author?: User;
	isMe: boolean;
	isFirstMsg: boolean;
}

export function MessageItem({
	msg,
	author,
	isMe,
	isFirstMsg,
}: MessageItemProps) {
	return (
		<div
			className={`flex ${isFirstMsg ? "mt-10 relative" : ""} gap-3 ${
				isMe ? "justify-end" : "justify-start"
			} items-start`}>
			{!isMe && isFirstMsg && (
				<>
					<p className="absolute left-12 text-[12px] text-gray-300 -top-4">
						{author?.user_name || "Usuário"}
					</p>
					<img
						className="aspect-square no-select h-8 rounded-full mt-2"
						src={`/Avatars/avatar (${
							author?.profile_img || 1
						}).png`}
						alt={author?.user_name}
					/>
				</>
			)}

			{!isMe && !isFirstMsg && <div className="w-8" />}

			<div className="my-1">
				<p
					className={`max-w-xs p-2 rounded-lg ${
						isMe
							? "verde-1 text-white text-right"
							: "cinza-1 text-left"
					}`}>
					{msg.conteudo}
				</p>
			</div>
		</div>
	);
}
