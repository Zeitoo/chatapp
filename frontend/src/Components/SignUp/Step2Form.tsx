// components/signup/Step2Form.tsx
import type { SignUpStepProps } from "../../Types";

const AVATAR_COUNT = 95;

export function Step2Form({
	formData,
	onChange,
	onNext,
	onBack,
}: SignUpStepProps) {
	const avatars = Array.from({ length: AVATAR_COUNT }, (_, i) => i + 1);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onNext();
			}}
			role="form"
			aria-label="Seleção de avatar">
			<div
				className="px-5 max-h-82 avatar-wrapper rounded-4xl overflow-y-auto overflow-x-hidden py-5 pb-0"
				role="region"
				aria-label="Lista de avatares disponíveis"
				tabIndex={0}>
				<div className="grid pb-10 grid-cols-3 gap-3">
					{avatars.map((avatarNumber) => (
						<button
							type="button"
							key={avatarNumber}
							onClick={() => onChange("avatar", avatarNumber)}
							className={`p-1 rounded-full transition-all ${
								formData.avatar === avatarNumber
									? "ring-4 ring-blue-500"
									: "hover:ring-2 hover:ring-gray-300"
							}`}
							aria-label={`Selecionar avatar ${avatarNumber}`}
							aria-pressed={formData.avatar === avatarNumber} // indica seleção
							tabIndex={0}>
							<img
								className="w-22 aspect-square rounded-full"
								src={`/Avatars/avatar (${avatarNumber}).png`}
								alt={`Avatar ${avatarNumber}`}
								loading="lazy"
							/>
						</button>
					))}
				</div>
			</div>

			<div className="p-5 grid grid-cols-2 gap-4 py-2">
				<button
					type="button"
					onClick={onBack}
					className="btn btn-gray w-full"
					tabIndex={0}>
					Anterior
				</button>
				<button
					type="submit"
					className="btn btn-blue w-full"
					tabIndex={0}>
					Criar conta
				</button>
			</div>
		</form>
	);
}
