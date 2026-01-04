import "./App.css";
import logo from "../public/vite.svg";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUser } from "./useUser";

function SignIn() {
	const navigate = useNavigate();
	const [modalMessage, setModalMessage] = useState<string>("");

	const { setUser } = useUser();
	const formRef = useRef<HTMLFormElement>(null);

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

		if (response.status === 401) {
			setModalMessage("Credenciais inválidas");
		}
	};

	useEffect(() => {
		document.title = "Inicio de Sessão";

		formRef.current?.addEventListener("submit", (e) => {
			e.preventDefault();

			const data: Record<string, FormDataEntryValue> = {};
			const formData = new FormData(formRef.current!);

			formData.forEach((value, key) => {
				data[key] = value;
			});

			mandarDados(JSON.stringify(data));
		});
	}, [formRef, mandarDados]);
	return (
		<>
			<div className="background relative w-lvw h-lvh flex items-center justify-center">
				<div className="p-5 h-125 w-125 rounded-l-lg bg-white z-10">
					<div className="bg-img rounded-2xl"></div>
				</div>
				<div className="form-container h-125 w-90 flex z-10 flex-col bg-white rounded-r-lg">
					<div className="mt-15">
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
					<form ref={formRef}>
						<div className="px-5 py-3">
							<label
								className="ml-1 text-sm font-medium"
								htmlFor="email">
								Email
							</label>
							<input
								value="user1@mail.com"
								placeholder="Endereco de e-mail"
								className="text py-10 px-3 outline-none border w-full border-gray-400 rounded-[7px]"
								type="text"
								id="email"
								name="email"
							/>
						</div>

						<div className="px-5 pb-4">
							<label
								className="ml-1 text-sm font-medium"
								htmlFor="password">
								Password
							</label>
							<input
								value={"hash1"}
								className="text py-2 px-5 outline-none border w-full border-gray-900 rounded-full"
								placeholder="Palavra-passe"
								type="password"
								id="password"
								name="password"
							/>

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
						<div className="p-5">
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
