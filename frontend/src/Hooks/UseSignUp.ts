// hooks/useSignUp.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
	validateAndSanitizeEmail, 
	validateAndSanitizeName, 
	validateAndSanitizePassword,
	prepareSafePayload 
} from '../utilits/security.utils';
import type { SignUpFormData, ValidationError } from '../Types';

const host = import.meta.env.VITE_API_URL;

export function useSignUp() {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<SignUpFormData>({
		primeiroNome: '',
		apelido: '',
		emailAddress: '',
		password: '',
		avatar: 1,
	});
	const [errors, setErrors] = useState<ValidationError[]>([]);
	const [apiError, setApiError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const updateFormData = useCallback((field: keyof SignUpFormData, value: string | number) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	}, []);

	const validateStep1 = useCallback((): boolean => {
		const newErrors: ValidationError[] = [];
		
		// Valida primeiro nome
		const firstNameValidation = validateAndSanitizeName(formData.primeiroNome, 'Primeiro nome');
		if (!firstNameValidation.isValid) {
			newErrors.push({ field: 'primeiroNome', message: firstNameValidation.error! });
		}
		
		// Valida apelido
		const lastNameValidation = validateAndSanitizeName(formData.apelido, 'Apelido');
		if (!lastNameValidation.isValid) {
			newErrors.push({ field: 'apelido', message: lastNameValidation.error! });
		}
		
		// Valida email
		const emailValidation = validateAndSanitizeEmail(formData.emailAddress);
		if (!emailValidation.isValid) {
			newErrors.push({ field: 'emailAddress', message: emailValidation.error! });
		}
		
		// Valida senha
		const passwordValidation = validateAndSanitizePassword(formData.password);
		if (!passwordValidation.isValid) {
			newErrors.push({ field: 'password', message: passwordValidation.error! });
		}
		
		setErrors(newErrors);
		return newErrors.length === 0;
	}, [formData]);

	const submitSignUp = useCallback(async (): Promise<boolean> => {
		setLoading(true);
		setApiError(null);
		
		try {
			const safePayload = prepareSafePayload({
				userName: `${formData.primeiroNome} ${formData.apelido}`,
				emailAddress: formData.emailAddress,
				password: formData.password,
				profileImg: formData.avatar,
			});
			
			const response = await fetch(`${host}/signup`, {
				method: 'POST',
				body: JSON.stringify(safePayload),
				headers: {
					'Content-Type': 'application/json',
				},
				// Adiciona timeout
				signal: AbortSignal.timeout(10000),
			});
			
			if (!response.ok) {
				let message = 'Erro inesperado no servidor';
				
				try {
					const errorData = await response.json();
					if (typeof errorData?.message === 'string') {
						message = errorData.message;
					}
				} catch {
					// Continua com a mensagem padrão
				}
				
				throw new Error(message);
			}
			
			const data = await response.json();
			console.log('Sign up successful:', data);
			
			// Limpa dados sensíveis da memória
			setFormData({
				primeiroNome: '',
				apelido: '',
				emailAddress: '',
				password: '',
				avatar: 1,
			});
			
			// Redireciona após delay
			setTimeout(() => {
				navigate('/');
			}, 2000);
			
			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Erro desconhecido';
			
			// Log seguro (não expõe detalhes sensíveis)
			console.error('Sign up error:', error instanceof Error ? error.name : 'Unknown error');
			
			setApiError(message);
			return false;
		} finally {
			setLoading(false);
		}
	}, [formData, navigate]);

	const nextStep = useCallback(() => {
		if (step === 1 && !validateStep1()) {
			return;
		}
		setStep(prev => prev + 1);
	}, [step, validateStep1]);

	const prevStep = useCallback(() => {
		setStep(prev => prev - 1);
	}, []);

	return {
		step,
		formData,
		errors,
		apiError,
		loading,
		updateFormData,
		nextStep,
		prevStep,
		submitSignUp,
		validateStep1,
	};
}