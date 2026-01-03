import "./App.css";
import logo from "../public/vite.svg";
import { useEffect } from "react";

function SignUp() {
	useEffect(() => {
		document.title = "Criar Conta";
	});

	return (
		<>
			<div className="background relative w-lvw h-lvh flex items-center justify-center">
				<div className="p-5 h-125 w-125 rounded-l-lg bg-white z-10">
					<div className="bg-img rounded-2xl"></div>
				</div>
				<div className="form-container h-125 w-90 flex flex-col bg-white rounded-r-lg">
					<div className="mt-12">
						<div className="flex justify-center">
							<img
								className=""
								src={logo}
								alt="Logotipo da plataforma"
							/>
						</div>
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
					</div>
					<form>
						<div className="px-5 py-5 pb-0 grid grid-cols-2 gap-4">
							<div>
								<label
									className="ml-1 text-sm font-medium"
									htmlFor="first-name">
									Primeiro nome
								</label>
								<input
									placeholder="Primeiro nome"
									className="text py-10 px-3 outline-none border w-full border-gray-400 rounded-[7px]"
									type="text"
									id="first-name"
								/>
							</div>
							<div>
								<label
									className="ml-1 text-sm font-medium"
									htmlFor="apelido">
									Apelido
								</label>
								<input
									placeholder="Apelido"
									className="text py-10 px-3 outline-none border w-full border-gray-400 rounded-[7px]"
									type="text"
									id="apelido"
								/>
							</div>
						</div>
						<div className="px-5 py-3">
							<label
								className="ml-1 text-sm font-medium"
								htmlFor="email">
								Email
							</label>
							<input
								placeholder="Endereco de e-mail"
								className="text py-10 px-3 outline-none border w-full border-gray-400 rounded-[7px]"
								type="text"
								id="email"
							/>
						</div>
						<div className="px-5 pb-0">
							<label
								className="ml-1 text-sm font-medium"
								htmlFor="password">
								Password
							</label>
							<input
								className="text py-2 px-5 outline-none border w-full border-gray-900 rounded-full"
								placeholder="Palavra-passe"
								type="password"
								id="password"
							/>

							<button>
								<span className="show-password"></span>
							</button>
						</div>

						<div className="p-5">
							<button
								className="btn btn-blue w-full"
								type="submit">
								Criar Uma conta
							</button>
						</div>
					</form>
				</div>

				<div className="blur"></div>
			</div>
		</>
	);
}

export default SignUp;
