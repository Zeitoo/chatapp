// components/RequestList.tsx
import type { User } from "../../Types";
import { RequestItem } from "./RequestItem";

interface RequestListProps {
	title: string;
	users: User[] | null;
	type: "recebido" | "enviado";
	onRejeitar?: (userId: number) => void;
	onAceitar?: (userId: number) => void;
	onCancelar?: (userId: number) => void;
}

export function RequestList({
	title,
	users,
	type,
	onRejeitar,
	onAceitar,
	onCancelar,
}: RequestListProps) {
	if (!users || users.length === 0) {
		return (
			<div>
				<p className="font-bold">{title}</p>
				<p className="text-gray-500 text-sm m-2">
					Nenhum pedido {type}
				</p>
			</div>
		);
	}

	return (
		<div>
			<p className="font-bold">{title}</p>
			<div>
				{users.map((user) => (
					<RequestItem
						key={user.id}
						user={user}
						type={type}
						onRejeitar={onRejeitar}
						onAceitar={onAceitar}
						onCancelar={onCancelar}
					/>
				))}
			</div>
		</div>
	);
}
