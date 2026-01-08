import "./App.css";
import logo from "../public/vite.svg";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "./loader";

interface User {
	userName: string;
	profileImg: number | undefined;
	emailAddress: string;
	password: string;
}

function SignUp() {
	const navigate = useNavigate();
	const [user, setUser] = useState<User | null>(null);
	const [step, setStep] = useState<number>(1);
	const [avatar, setAvatar] = useState<number>(1);
	const [primeiroNome, setPrimeiroNome] = useState<string>("");
	const [apelido, setApelido] = useState<string>("");
	const [emailAddress, setEmailAddress] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [hasError, setHasError] = useState<boolean>(false);
	const [hasReqError, setHasReqError] = useState<{ error: string } | null>(
		null
	);

	const nomeError = useRef<HTMLParagraphElement>(null);
	const apelidoError = useRef<HTMLParagraphElement>(null);
	const emailError = useRef<HTMLParagraphElement>(null);
	const passwordError = useRef<HTMLParagraphElement>(null);

	const host = import.meta.env.VITE_API_URL;
	const formRef = useRef<HTMLFormElement>(null);

	const lista: number[] = [];
	for (let c = 1; c < 116; c++) {
		lista.push(c);
	}

	const mandarDados = async (user: User | null) => {
		try {
			const response = await fetch(`${host}/signup`, {
				method: "POST",
				body: JSON.stringify({
					userName: user?.userName,
					emailAddress: user?.emailAddress,
					password: user?.password,
					profileImg: user?.profileImg,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				let message = "Erro inesperado no servidor";

				try {
					const errorData = await response.json();
					if (typeof errorData?.message === "string") {
						message = errorData.message;
					}
				} catch {
					// resposta não era JSON, vida que segue
				}

				throw new Error(message);
			}

			const data = await response.json();

			console.log("sign up ok:", data);
			setTimeout(() => {
				navigate("/");
			}, 1000);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Erro desconhecido";

			setHasReqError({ error: message });
		}
	};

	const validarStep1 = () => {
		let temErro = false;
		if (!primeiroNome.trim()) {
			const input = nomeError.current
				?.previousSibling as HTMLElement | null;
			input?.classList.add("error");

			nomeError.current!.innerText = "Obrigatório";
			temErro = true;
		} else {
			const input = nomeError.current
				?.previousSibling as HTMLElement | null;
			input?.classList.remove("error");

			nomeError.current!.innerText = "";
		}

		if (!apelido.trim()) {
			const input = apelidoError.current
				?.previousSibling as HTMLElement | null;
			input?.classList.add("error");

			apelidoError.current!.innerText = "Obrigatório";
			temErro = true;
		} else {
			const input = apelidoError.current
				?.previousSibling as HTMLElement | null;
			input?.classList.remove("error");

			apelidoError.current!.innerText = "";
		}

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

			passwordError.current!.innerText = "Obrigatório";
			temErro = true;
		} else {
			const input = passwordError.current
				?.previousSibling as HTMLElement | null;
			input?.classList.remove("error");

			passwordError.current!.innerText = "";
		}

		setHasError(temErro);
		return temErro;
	};

	const clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		if (step === 1) {
			const erro = validarStep1();
			if (erro) {
				return;
			}

			setUser({
				userName: `${primeiroNome} ${apelido}`,
				emailAddress,
				password,
				profileImg: avatar,
			});

			setStep(2);
			return;
		}

		if (step === 2 && user) {
			mandarDados({
				...user,
				profileImg: avatar,
			});
		}
		setStep(3);
	};

	useEffect(() => {
		document.title = "Criar Conta";
	}, []);

	return (
		<>
			<div className="background sign-up relative w-lvw h-lvh flex items-center justify-center">
				<div className="p-5 h-130 w-130 rounded-l-lg bg-white z-10">
					<div className="bg-img rounded-2xl"></div>
				</div>
				<div className="form-container h-130 w-90 flex flex-col bg-white rounded-r-lg">
					<div>
						<div className="mt-12">
							<div className="flex justify-center">
								{step === 1 ? (
									<img
										className=""
										src={logo}
										alt="Logotipo da plataforma"
									/>
								) : (
									""
								)}
								{step === 2 ? (
									<img
										className="w-22 aspect-square rounded-[100px]"
										src={`/Avatars/avatar (${avatar}).png`}
										alt="Avatar do Perfil"
									/>
								) : (
									" "
								)}

								{step === 3 ? (
									<img
										className="w-22 aspect-square rounded-[100px]"
										src={`/Avatars/avatar (${avatar}).png`}
										alt="Avatar do Perfil"
									/>
								) : (
									" "
								)}
							</div>
							{step === 1 ? (
								<>
									<h1 className="text-2xl font-bold px-6 pt-10">
										Crie uma conta
									</h1>
									<p className="text-sm px-6 text-gray-600 pt-2">
										Ja tem uma conta?{" "}
										<a
											className="font-medium text-indigo-950"
											href="">
											Iniciar de Sessão
										</a>
									</p>
								</>
							) : (
								""
							)}
							{step === 2 ? (
								<>
									<h2 className="text-center pb-2 font-medium">
										{user?.userName}
									</h2>
								</>
							) : (
								" "
							)}

							{step === 3 ? (
								<>
									<h2 className="text-center pb-2 my-4 text-lg font-medium">
										{user?.userName}
									</h2>
								</>
							) : (
								" "
							)}
						</div>
						{step == 1 ? (
							<form ref={formRef}>
								<div className="px-5 py-2 pb-0 grid grid-cols-2 gap-4">
									<div>
										<label
											className="ml-1 text-sm font-medium"
											htmlFor="first-name">
											Primeiro nome
										</label>
										<input
											value={primeiroNome}
											onChange={(e) => {
												if (hasError) {
													validarStep1();
												}
												setPrimeiroNome(e.target.value);
											}}
											placeholder="Primeiro nome"
											className="text mt-1 py-10 px-3 outline-none border w-full border-gray-400 rounded-[7px]"
											type="text"
											id="first-name"
											name="primeiroNome"
										/>
										<p
											ref={nomeError}
											className="text-red-600 error-msg text-sm px-1 pt-1"></p>
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
											className="text mt-1 py-10 px-3 outline-none border w-full border-gray-400 rounded-[7px]"
											type="text"
											id="apelido"
											value={apelido}
											onChange={(e) => {
												if (hasError) {
													validarStep1();
												}
												setApelido(e.target.value);
											}}
										/>
										<p
											ref={apelidoError}
											className="text-red-600 error-msg text-sm px-1 pt-1"></p>
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
										placeholder="Endereco de e-mail"
										className="text mt-1 py-10 px-3 outline-none border w-full border-gray-400 rounded-[7px]"
										type="text"
										id="email"
										value={emailAddress}
										onChange={(e) => {
											if (hasError) {
												validarStep1();
												e.target.value;
											}

											setEmailAddress(e.target.value);
										}}
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
										name="password"
										className="text mt-1 py-2 px-5 outline-none border w-full border-gray-900 rounded-full"
										placeholder="Palavra-passe"
										type="password"
										id="password"
										value={password}
										onChange={(e) => {
											if (hasError) {
												validarStep1();
												e.target.value;
											}
											setPassword(e.target.value);
										}}
									/>
									<p
										ref={passwordError}
										className="text-red-600 error-msg text-sm px-1 pt-1"></p>

									<button>
										<span className="show-password"></span>
									</button>
								</div>

								<div className="p-5 py-0">
									<button
										onClick={(e) => {
											clickHandler(e);
										}}
										className="btn btn-blue w-full relative -top-5"
										type="submit">
										Prosseguir
									</button>
								</div>
							</form>
						) : (
							""
						)}
						{step == 2 ? (
							<form ref={formRef}>
								<div className="px-5 max-h-72 avatar-wrapper rounded-4xl overflow-scroll overflow-x-hidden py-5 pb-0">
									<div className="grid grid-cols-3 gap-3">
										{lista.map((element) => {
											return (
												<img
													onClick={() => {
														setAvatar(element);
													}}
													className="w-22 aspect-square rounded-[100px]"
													src={`/Avatars/avatar (${element}).png`}
													alt="Avatar do Perfil"
												/>
											);
										})}
									</div>
								</div>
								<div className="p-5 grid grid-cols-2 gap-4 py-2">
									<button
										onClick={() => {
											setStep(1);
										}}
										className="btn btn-gray w-full">
										Anterior
									</button>
									<button
										onClick={(e) => {
											clickHandler(e);
										}}
										className="btn btn-blue w-full"
										type="submit">
										Criar conta
									</button>
								</div>
							</form>
						) : (
							""
						)}

						{step == 3 ? (
							<>
								<div className="">
									{!hasReqError ? (
										<>
											<p className="px-2 pr-3 text-gray-700 text-sm mt-10 text-center font-medium">
												A sua conta esta sendo criada,
												voce sera redirecionada para a
												pagina de login brevemente.
											</p>
											<div className="flex justify-center h-60  items-center">
												<Loader></Loader>
											</div>
										</>
									) : (
										<>
											<p className="px-2 pr-3 text-gray-700 text-sm mt-10 text-center font-medium">
												Houve um erro ao criar a sua
												conta, descricao:{" "}
												<span className="font-bold">
													{hasReqError.error}{" "}
												</span>
											</p>
											<p className="px-2 pr-3 text-gray-700 text-sm mt-1 text-center font-medium">
												Tente criar a conta novamente{" "}
											</p>

											<div className="flex justify-center px-10 h-60  items-center">
												<button
													onClick={(e) => {
														clickHandler(e);
														window.location.reload();
													}}
													className="btn btn-blue w-full"
													type="submit">
													Tentar novamente
												</button>
											</div>
										</>
									)}
								</div>
							</>
						) : (
							""
						)}
					</div>
				</div>

				<div className="blur"></div>
			</div>
		</>
	);
}

export default SignUp;
