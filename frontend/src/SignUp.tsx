// SignUp.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSignUp } from "./Hooks/UseSignUp";
import { Step1Form } from "./Components/SignUp/Step1Form";
import { Step2Form } from "./Components/SignUp/Step2Form";
import { Step3Form } from "./Components/SignUp/Step3Form";
import logo from "../public/vite.svg";

export default function SignUp() {
	const {
		step,
		formData,
		errors,
		apiError,
		loading,
		updateFormData,
		nextStep,
		prevStep,
		submitSignUp,
	} = useSignUp();

	const handleSubmit = async () => {
		if (step === 2) {
			await submitSignUp();
			nextStep();
		} else {
			nextStep();
		}
	};

	useEffect(() => {
		document.title = "Criar Conta";
	}, []);

	const renderStep = () => {
		switch (step) {
			case 1:
				return (
					<Step1Form
						formData={formData}
						onChange={updateFormData}
						onNext={nextStep}
						errors={errors}
					/>
				);
			case 2:
				return (
					<Step2Form
						formData={formData}
						onChange={updateFormData}
						onNext={handleSubmit}
						onBack={prevStep}
					/>
				);
			case 3:
				return (
					<Step3Form
						onChange={""}
						formData={formData}
						apiError={apiError}
						loading={loading}
						onNext={() => window.location.reload()}
					/>
				);
			default:
				return null;
		}
	};

	const renderAvatar = () => {
		if (step === 1) {
			return (
				<img
					src={logo}
					alt="Logotipo da plataforma"
				/>
			);
		}
		return (
			<img
				className="w-22 aspect-square rounded-full"
				src={`/Avatars/avatar (${formData.avatar}).png`}
				alt={`Avatar do usuário ${formData.primeiroNome}`}
			/>
		);
	};

	return (
		<div className="background sign-up relative w-dvw h-dvh flex items-center justify-center">
			<div className="p-5 h-130 w-80 bg-wrapper-login md:w-125 rounded-l-lg bg-white z-10">
				<div className="bg-img rounded-2xl"></div>
			</div>

			<div className="form-container h-130 w-90 flex flex-col bg-white rounded-r-lg">
				<div className="mt-12">
					<div className="flex justify-center">{renderAvatar()}</div>

					{step === 1 && (
						<>
							<h1 className="text-2xl font-bold px-6 pt-10">
								Crie uma conta
							</h1>
							<p className="text-sm px-6 text-gray-600 pt-2">
								Já tem uma conta?{" "}
								<Link
									className="font-medium text-indigo-950 hover:underline"
									to="/signin">
									Iniciar Sessão
								</Link>
							</p>
						</>
					)}

					{step === 2 && (
						<h2 className="text-center pb-2 font-medium">
							{formData.primeiroNome} {formData.apelido}
						</h2>
					)}

					{step === 3 && (
						<h2 className="text-center pb-2 my-4 text-lg font-medium">
							{formData.primeiroNome} {formData.apelido}
						</h2>
					)}
				</div>

				{renderStep()}
			</div>

			<div className="blur"></div>
		</div>
	);
}
