// components/signup/Step3Form.tsx
import { Loader } from "../../loader";
import type { SignUpStepProps } from "../../Types";

export function Step3Form({
	apiError,
	loading,
	onNext,
}: SignUpStepProps) {
	return (
		<div className="px-5">
			{!apiError ? (
				<>
					<p className="text-gray-700 text-sm mt-10 text-center font-medium">
						Sua conta está sendo criada. Você será redirecionado
						para a página de login em breve.
					</p>
					<div className="flex justify-center h-60 items-center">
						{loading ? (
							<Loader />
						) : (
							<div className="text-green-600 font-medium">
								✓ Conta criada com sucesso!
							</div>
						)}
					</div>
				</>
			) : (
				<>
					<p className="text-gray-700 text-sm mt-10 text-center">
						Houve um erro ao criar sua conta:{" "}
						<span className="font-bold text-red-600">
							{apiError}
						</span>
					</p>
					<p className="text-gray-700 text-sm mt-1 text-center">
						Tente novamente ou entre em contato com o suporte.
					</p>

					<div className="flex justify-center px-10 h-60 items-center">
						<button
							onClick={onNext}
							className="btn btn-blue w-full"
							type="button">
							Tentar novamente
						</button>
					</div>
				</>
			)}
		</div>
	);
}
