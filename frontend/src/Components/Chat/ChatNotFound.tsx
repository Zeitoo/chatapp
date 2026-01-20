import { useNavigate, Link } from "react-router-dom";

type ChatNotFoundProps = {
	setOpenedChats: React.Dispatch<React.SetStateAction<string | null>>;
};

export function ChatNotFound({ setOpenedChats }: ChatNotFoundProps) {
	const navigate = useNavigate();

	const redirect = () => {
		setTimeout(() => {
			setOpenedChats(null);
		}, 300);

		navigate("/direct");
	};

	return (
		<div className="h-dvh flex items-center justify-center flex-col">
			<h1 className="font-bold text-2xl mb-5">
				404. Chat não encontrado
			</h1>
			<Link
				to=""
				onClick={(e) => {
					e.preventDefault();
					redirect();
				}}
				className="text-blue-500 hover:underline">
				Clique aqui para voltar
			</Link>
		</div>
	);
}
