import { useRef, useState } from "react";

interface EditableBoxProps {
	onAction: (value: string) => void;
	placeholder?: string;
}

export const EditableBox: React.FC<EditableBoxProps> = ({
	onAction,
	placeholder = "Digite uma mensagem...",
}) => {
	const divRef = useRef<HTMLDivElement>(null);
	const [hasContent, setHasContent] = useState(false);

	const handleClick = () => {
		if (!divRef.current || !hasContent) return;

		const value = divRef.current.textContent || "";
		if (value.trim()) {
			onAction(value);
		}

		// Limpar conteúdo após enviar
		if (divRef.current) {
			divRef.current.textContent = "";
			setHasContent(false);
		}
	};

	const handleInput = () => {
		if (!divRef.current) return;

		const text = divRef.current.textContent || "";
		setHasContent(text.trim() !== "");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleClick();
		}
	};

	return (
		<div className="cinza-1 w-full flex items-center relative min-h-10 rounded-lg p-3">
			<div
				ref={divRef}
				contentEditable
				suppressContentEditableWarning
				className={`flex-1 outline-none w-full max-w-full overflow-y-auto max-h-32 break-words ${
					!hasContent ? "placeholder-visible" : ""
				}`}
				onKeyDown={handleKeyDown}
				onInput={handleInput}
				data-placeholder={placeholder}
				style={{
                    translate: "-40px 0px",
					minHeight: "1.2rem",
					maxHeight: "8rem",
					caretColor: "var(--color-blue-500)",
					paddingRight: "0.5rem", // afasta conteúdo da scrollbar e do botão
					boxSizing: "content-box",
                    paddingLeft: "40px"
				}}
			/>

			<button
				className={`absolute send-btn right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
					hasContent
						? "bg-green-400 text-white hover:bg-green-500"
						: "bg-gray-300 text-gray-500 cursor-not-allowed"
				}`}
				onClick={handleClick}
				type="button"
				disabled={!hasContent}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="size-5">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
					/>
				</svg>
			</button>

			<style jsx>{`
				.placeholder-visible:empty::before {
					content: attr(data-placeholder);
					color: #9ca3af;
					font-style: italic;
					pointer-events: none;
				}
			`}</style>
		</div>
	);
};
