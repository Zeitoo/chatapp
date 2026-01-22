// components/ChatHeader.tsx
import type { Chat } from "../../Types";

interface ChatHeaderProps {
	currentChat: Chat;
	onBack: () => void;
}

export function ChatHeader({ currentChat, onBack }: ChatHeaderProps) {
	return (
		<div
			style={{ backdropFilter: "blur(8px)" }}
			className="flex chat-header gap-1 items-center h-16 shrink-0">
			<button
				onClick={onBack}
				className="back-btn ml-3.5"
				aria-label="Voltar">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="size-6">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 18 18 6M6 6l12 12"
					/>
				</svg>
			</button>

			<div className="avatar h-10 aspect-square rounded-full ml-2">
				<img
					className="w-full no-select rounded-full"
					src={`/Avatars/avatar (${currentChat.profile_img}).png`}
					alt={currentChat.chat_name}
				/>
			</div>

			<div className="pl-2">
				<p className="user-name">{currentChat.chat_name}</p>
			</div>
		</div>
	);
}
