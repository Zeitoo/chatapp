// components/signup/Step2Form.tsx
import type { SignUpStepProps } from "../../Types";

const AVATAR_COUNT = 115;

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
			}}>
			<div className="px-5 max-h-72 avatar-wrapper rounded-4xl overflow-y-auto overflow-x-hidden py-5 pb-0">
				<div className="grid grid-cols-3 gap-3">
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
							aria-label={`Selecionar avatar ${avatarNumber}`}>
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
					className="btn btn-gray w-full">
					Anterior
				</button>
				<button
					type="submit"
					className="btn btn-blue w-full">
					Criar conta
				</button>
			</div>
		</form>
	);
}
