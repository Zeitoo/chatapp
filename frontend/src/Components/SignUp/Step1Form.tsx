// components/signup/Step1Form.tsx
import type { SignUpStepProps } from "../../Types";
import { useState } from "react";

export function Step1Form({
	formData,
	onChange,
	onNext,
	errors,
}: SignUpStepProps) {
	const getError = (field: string) => {
		return errors
			?.find((e) => e.field === field)
			?.message.replace("Primeiro nome", "")
			.replace("Apelido", "");
	};

	const [hidePassword, setHidePassword] = useState<boolean>(false);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				console.log(getError("primeiroNome"));
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
						/*
						required
						minLength={2}
						maxLength={30}
						pattern="[a-zA-ZÀ-ÿ\s\-']+"*/
					/>
					{getError("primeiroNome") && (
						<p className="text-red-600 error-msg  text-sm px-1 pt-1">
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
						/*required
						minLength={2}
						maxLength={20}
						pattern="[a-zA-ZÀ-ÿ\s\-']+"*/
					/>
					{getError("apelido") && (
						<p className="text-red-600 error-msg  text-sm px-1 pt-1">
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
					/*required
					maxLength={50}*/
				/>
				{getError("emailAddress") && (
					<p className="text-red-600 error-msg  text-sm px-1 pt-1">
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
				<div className="relative">
					<input
						name="password"
						className={`text mt-1 py-2 px-5 outline-none border w-full border-gray-900 rounded-full ${
							getError("password") ? "border-red-500" : ""
						}`}
						placeholder="Palavra-passe"
						type={hidePassword ? "password" : "text"}
						id="password"
						value={formData.password}
						onChange={(e) => onChange("password", e.target.value)}
						/*required
						minLength={6}
						maxLength={10}
						title="Deve conter letras maiúsculas, minúsculas, números e caracteres especiais*/
					/>

					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							setHidePassword(!hidePassword);
						}}
						className="show-password absolute top-1/2 right-2 -translate-y-1/2 scale-75">
						{!hidePassword ? (
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
									d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
								/>
							</svg>
						) : (
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
									d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
								/>
							</svg>
						)}
					</button>
				</div>
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
