import "./App.css";
import logo from "../public/vite.svg";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUser } from "./useUser";

function SignIn() {
	const navigate = useNavigate();
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
				navigate("/");
			}, 500);

			return;
		}
	};

	const validarStep1 = () => {
		let temErro = false;

		if (!emailAddress.trim()) {
			const input = emailError.current
				?.previousSibling as HTMLElement | null;
			input?.classList.add("error");

			emailError.current!.innerText = "Obrigatório";
			temErro = true;
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
			const input = emailError.current
				?.previousSibling as HTMLElement | null;
			input?.classList.add("error");
			emailError.current!.innerText = "Email inválido";
			temErro = true;
		} else {
			const input = emailError.current
				?.previousSibling as HTMLElement | null;
			input?.classList.remove("error");

			emailError.current!.innerText = "";
		}

		if (password.length < 6) {
			const input = passwordError.current
				?.previousSibling as HTMLElement | null;
			input?.classList.add("error");

			passwordError.current!.innerText = "Deve ter 6 no minimo";
			temErro = true;
		} else {
			const input = passwordError.current
				?.previousSibling as HTMLElement | null;
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
		document.title = "Inicio de Sessão";

		if (hasError) {
			validarStep1();
		}
	}, [emailAddress, password, hasError]);

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

						<div className="px-5 pb-0">
							<label
								className="ml-1 text-sm font-medium"
								htmlFor="password">
								Password
							</label>
							<input
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
								}}
								className="text py-2 px-5 outline-none border w-full border-gray-900 rounded-full"
								placeholder="Palavra-passe"
								type="password"
								id="password"
								name="password"
							/>
							<p
								ref={passwordError}
								className="text-red-600 error-msg text-sm px-1 pt-1"></p>

							<button>
								<span className="show-password"></span>
							</button>
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
						<a
							className="font-medium text-indigo-950"
							href="">
							Criar conta
						</a>
					</p>
				</div>

				<div className="blur"></div>
			</div>
		</>
	);
}

export default SignIn;
