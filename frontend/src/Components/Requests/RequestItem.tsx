// components/RequestItem.tsx
import type { User } from "../../Types";

interface RequestItemProps {
	user: User;
	type: "recebido" | "enviado";
	onRejeitar?: (userId: number) => void;
	onAceitar?: (userId: number) => void;
	onCancelar?: (userId: number) => void;
}

export function RequestItem({
	user,
	type,
	onRejeitar,
	onAceitar,
	onCancelar,
}: RequestItemProps) {
	return (
		<div className="m-2 my-3 profile flex items-center justify-between gap-2 p-3 rounded-lg">
			<div className="flex items-center gap-3">
				<img
					className="w-13 no-select rounded-full"
					src={`/Avatars/avatar (${user.profile_img}).png`}
					alt={user.user_name}
				/>
				<p className="font-medium">{user.user_name}</p>
			</div>

			<div className="flex gap-3 items-center">
				{type === "recebido" && (
					<>
						<button
							onClick={() => onRejeitar?.(user.id)}
							className="cursor"
							aria-label="Rejeitar pedido">
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
						<button
							onClick={() => onAceitar?.(user.id)}
							className="cursor"
							aria-label="Aceitar pedido">
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
									d="m4.5 12.75 6 6 9-13.5"
								/>
							</svg>
						</button>
					</>
				)}

				{type === "enviado" && (
					<button
						onClick={() => onCancelar?.(user.id)}
						className="cursor"
						aria-label="Cancelar pedido">
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
				)}
			</div>
		</div>
	);
}
