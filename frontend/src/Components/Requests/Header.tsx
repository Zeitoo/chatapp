// components/RequestsHeader.tsx
interface RequestsHeaderProps {
	onBack: () => void;
	title: string;
}

export function RequestsHeader({ onBack, title }: RequestsHeaderProps) {
	return (
		<div className="flex items-center">
			<button
				onClick={onBack}
				className="back-btn cursor flex items-center ml-4"
				aria-label="Voltar"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="size-6"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 18 18 6M6 6l12 12"
					/>
				</svg>
			</button>
			<h1 className="font-bold mx-2 m-5 text-xl">{title}</h1>
		</div>
	);
}