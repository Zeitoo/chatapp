// components/signup/Step1Form.tsx
import type { SignUpStepProps } from "../../Types";

export function Step1Form({
	formData,
	onChange,
	onNext,
	errors,
}: SignUpStepProps) {
	const getError = (field: string) =>
		errors?.find((e) => e.field === field)?.message;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onNext();
			}}>
			<div className="px-5 py-2 pb-0 grid grid-cols-2 gap-4">
				<div>
					<label
						className="ml-1 text-sm font-medium"
						htmlFor="first-name">
						Primeiro nome
					</label>
					<input
						value={formData.primeiroNome}
						onChange={(e) =>
							onChange("primeiroNome", e.target.value)
						}
						placeholder="Primeiro nome"
						className={`text mt-1 py-2 px-3 outline-none border w-full border-gray-400 rounded-[7px] ${
							getError("primeiroNome") ? "border-red-500" : ""
						}`}
						type="text"
						id="first-name"
						name="primeiroNome"
						required
						minLength={2}
						maxLength={30}
						pattern="[a-zA-ZÀ-ÿ\s\-']+"
					/>
					{getError("primeiroNome") && (
						<p className="text-red-600 text-sm px-1 pt-1">
							{getError("primeiroNome")}
						</p>
					)}
				</div>

				<div>
					<label
						className="ml-1 text-sm font-medium"
						htmlFor="apelido">
						Apelido
					</label>
					<input
						name="apelido"
						placeholder="Apelido"
						className={`text mt-1 py-2 px-3 outline-none border w-full border-gray-400 rounded-[7px] ${
							getError("apelido") ? "border-red-500" : ""
						}`}
						type="text"
						id="apelido"
						value={formData.apelido}
						onChange={(e) => onChange("apelido", e.target.value)}
						required
						minLength={2}
						maxLength={20}
						pattern="[a-zA-ZÀ-ÿ\s\-']+"
					/>
					{getError("apelido") && (
						<p className="text-red-600 text-sm px-1 pt-1">
							{getError("apelido")}
						</p>
					)}
				</div>
			</div>

			<div className="px-5 py-2">
				<label
					className="ml-1 text-sm font-medium"
					htmlFor="email">
					Email
				</label>
				<input
					name="emailAddress"
					placeholder="Endereço de e-mail"
					className={`text mt-1 py-2 px-3 outline-none border w-full border-gray-400 rounded-[7px] ${
						getError("emailAddress") ? "border-red-500" : ""
					}`}
					type="email"
					id="email"
					value={formData.emailAddress}
					onChange={(e) => onChange("emailAddress", e.target.value)}
					required
					maxLength={254}
				/>
				{getError("emailAddress") && (
					<p className="text-red-600 text-sm px-1 pt-1">
						{getError("emailAddress")}
					</p>
				)}
			</div>

			<div className="px-5 pb-0">
				<label
					className="ml-1 text-sm font-medium"
					htmlFor="password">
					Senha
				</label>
				<input
					name="password"
					className={`text mt-1 py-2 px-5 outline-none border w-full border-gray-900 rounded-full ${
						getError("password") ? "border-red-500" : ""
					}`}
					placeholder="Palavra-passe"
					type="password"
					id="password"
					value={formData.password}
					onChange={(e) => onChange("password", e.target.value)}
					required
					minLength={8}
					maxLength={12}
					title="Deve conter letras maiúsculas, minúsculas, números e caracteres especiais"
				/>
				{getError("password") && (
					<p className="text-red-600 error-msg text-sm px-1 pt-1">
						{getError("password")}
					</p>
				)}

				{!getError("password") ? (
					<div className="text-xs text-gray-600 mt-2">
						<p>• Mínimo 8 caracteres</p>
						<p>• Números e caracteres especiais</p>
					</div>
				) : (
					""
				)}
			</div>

			<div className="p-5 py-0">
				<button
					type="submit"
					className="btn btn-blue w-full relative top-2">
					Prosseguir
				</button>
			</div>
		</form>
	);
}
