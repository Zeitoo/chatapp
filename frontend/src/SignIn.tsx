import logo from "../public/vite.svg";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUser } from "./Hooks/useUser";

function SignIn() {
	const navigate = useNavigate();
	const setLogged =
		useOutletContext<React.Dispatch<React.SetStateAction<boolean>>>();
	const [hidePassword, setHidePassword] = useState<boolean>(true);
	const [hasError, setHasError] = useState<boolean>(false);
	const [emailAddress, setEmailAddress] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const emailError = useRef<HTMLParagraphElement>(null);
	const passwordError = useRef<HTMLParagraphElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const { setUser } = useUser();

	const host = import.meta.env.VITE_API_URL;

	const mandarDados = async (dados: string) => {
		const response = await fetch(`${host}/login/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: dados,
			credentials: "include",
		});

		if (response.status === 200) {
			const data = await response.json();

			setUser(data.user);

			setTimeout(() => {
				setLogged(true);
			}, 1000);

			navigate("/");

			return;
		} else {
			const input = emailError.current
				?.previousElementSibling as HTMLElement | null;

			input?.classList.add("error");

			emailError.current!.innerText = "Credenciais invalidas";

			const inputP = passwordError.current
				?.previousElementSibling as HTMLElement | null;
			inputP?.classList.add("error");

			passwordError.current!.innerText = "Credenciais invalidas";

			setHasError(true);
		}
	};

	const validarStep1 = () => {
		let temErro = false;

		if (!emailAddress.trim()) {
			const input = emailError.current
				?.previousElementSibling as HTMLElement | null;
			input?.classList.add("error");

			emailError.current!.innerText = "Obrigatório";
			temErro = true;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
			const input = emailError.current
				?.previousElementSibling as HTMLElement | null;
			input?.classList.add("error");
			emailError.current!.innerText = "Email inválido";
			temErro = true;
		} else {
			const input = emailError.current
				?.previousElementSibling as HTMLElement | null;
			input?.classList.remove("error");

			emailError.current!.innerText = "";
		}

		if (password.length < 6) {
			const input = passwordError.current
				?.previousElementSibling as HTMLElement | null;
			input?.classList.add("error");

			passwordError.current!.innerText = "Deve ter 6 no minimo";
			temErro = true;
		} else {
			const input = passwordError.current
				?.previousElementSibling as HTMLElement | null;
			input?.classList.remove("error");

			passwordError.current!.innerText = "";
		}
		if (!hasError) {
			setHasError(temErro);
		}
		return temErro;
	};

	const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validarStep1()) {
			const data: Record<string, FormDataEntryValue> = {};
			const formData = new FormData(formRef.current!);

			formData.forEach((value, key) => {
				data[key] = value;
			});

			mandarDados(JSON.stringify(data));
		}
	};

	useEffect(() => {
		if (hasError) {
			validarStep1();
		}
	}, [emailAddress, password]);

	useEffect(() => {
		document.title = "Inicio de Sessão";
	}, []);

	return (
		<>
			<div className="background sign-in relative w-dvw h-dvh flex items-center justify-center">
				<div className="p-5 h-125 w-80 bg-wrapper-login md:w-125 rounded-l-lg bg-white z-10">
					<div className="bg-img rounded-2xl"></div>
				</div>
				<div className="form-container h-125 w-90 flex z-10 flex-col bg-white rounded-r-lg">
					<div className="mt-10">
						<div className="flex justify-center">
							<img
								className=""
								src={logo}
								alt="Logotipo da plataforma"
							/>
						</div>
						<h1 className="text-2xl font-bold text-center pt-10">
							Bem-vindo de volta
						</h1>
						<p className="text-center text-gray-600 text-sm pt-2">
							Por favor, insira suas credenciais
						</p>
					</div>
					<form
						ref={formRef}
						onSubmit={(e) => submitHandler(e)}>
						<div className="px-5 py-3 pb-1">
							<label
								className="ml-1 text-sm font-medium"
								htmlFor="email">
								Email
							</label>
							<input
								value={emailAddress}
								onChange={(e) => {
									setEmailAddress(e.target.value);
								}}
								placeholder="Endereco de e-mail"
								className="text py-10 px-3 outline-none border w-full border-gray-400 rounded-[7px]"
								type="text"
								id="email"
								name="email"
							/>
							<p
								ref={emailError}
								className="text-red-600 error-msg text-sm px-1 pt-1"></p>
						</div>

						<div className="px-5 pb-6">
							<label
								className="ml-1 text-sm font-medium"
								htmlFor="password">
								Password
							</label>
							<div className="relative">
								<input
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
									}}
									className="text py-2 px-5 outline-none border w-full border-gray-900 rounded-full"
									placeholder="Palavra-passe"
									type={`${
										hidePassword ? "password" : "text"
									}`}
									id="password"
									name="password"
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
							<p
								ref={passwordError}
								className="text-red-600 error-msg text-sm px-1 pt-1"></p>
						</div>
						<div className="px-6 text-[12px] flex justify-between items-center text-sm">
							<div className="inline-flex items-center">
								<input
									className="check nline"
									type="checkbox"
									name="remember"
									id="remember"
								/>
								<label
									className="mx-1"
									htmlFor="remember">
									Lembrar por 7 dias
								</label>
							</div>

							<a
								className="text-indigo-900 font-medium"
								href="#">
								Recuperar palavra-passe
							</a>
						</div>
						<div className="p-5 py-2">
							<button
								className="btn btn-blue w-full"
								type="submit">
								Continuar
							</button>
						</div>
					</form>

					<p className="text-sm text-center">
						Nao tem uma conta?{" "}
						<Link
							className="font-medium text-indigo-950"
							to={"/signup"}>
							Criar conta
						</Link>
					</p>
				</div>

				<div className="blur"></div>
			</div>
		</>
	);
}

export default SignIn;
