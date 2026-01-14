// utils/security.utils.ts
/**
 * Sanitiza inputs para prevenir XSS
 */
export function sanitizeInput(input: string): string {
	const map: { [key: string]: string } = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'/': '&#x2F;',
		'`': '&grave;',
	};

	const reg = /[&<>"'/`]/gi;
	return input.replace(reg, (match) => map[match] || match);
}

/**
 * Valida e sanitiza email
 */
export function validateAndSanitizeEmail(email: string): { 
	email: string; 
	isValid: boolean; 
	error?: string 
} {
	// Sanitiza primeiro
	const sanitized = sanitizeInput(email.trim());
	
	// Valida formato
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
	if (!sanitized) {
		return { email: '', isValid: false, error: 'Email é obrigatório' };
	}
	
	if (!emailRegex.test(sanitized)) {
		return { email: sanitized, isValid: false, error: 'Email inválido' };
	}
	
	// Valida comprimento máximo (prevenção DoS)
	if (sanitized.length > 254) {
		return { email: sanitized, isValid: false, error: 'Email muito longo' };
	}
	
	return { email: sanitized, isValid: true };
}

/**
 * Valida e sanitiza nome
 */
export function validateAndSanitizeName(name: string, field: string): { 
	name: string; 
	isValid: boolean; 
	error?: string 
} {
	const sanitized = sanitizeInput(name.trim());
	
	if (sanitized.length < 2) {
		return { 
			name: sanitized, 
			isValid: false, 
			error: `${field} deve ter no mínimo 2 caracteres` 
		};
	}
	
	if (sanitized.length > 50) {
		return { 
			name: sanitized, 
			isValid: false, 
			error: `${field} muito longo (máximo 50 caracteres)` 
		};
	}
	
	// Valida se contém apenas caracteres permitidos (letras, espaços, hífens)
	const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
	if (!nameRegex.test(sanitized)) {
		return { 
			name: sanitized, 
			isValid: false, 
			error: `${field} contém caracteres inválidos` 
		};
	}
	
	return { name: sanitized, isValid: true };
}

/**
 * Valida e sanitiza senha
 */
export function validateAndSanitizePassword(password: string): { 
	password: string; 
	isValid: boolean; 
	error?: string 
} {
	const sanitized = sanitizeInput(password);
	
	if (sanitized.length < 8) {
		return { 
			password: sanitized, 
			isValid: false, 
			error: 'Senha deve ter no mínimo 8 caracteres' 
		};
	}
	
	if (sanitized.length > 128) {
		return { 
			password: sanitized, 
			isValid: false, 
			error: 'Senha muito longa' 
		};
	}
	
	// Valida força da senha
	const hasUpperCase = /[A-Z]/.test(sanitized);
	const hasLowerCase = /[a-z]/.test(sanitized);
	const hasNumbers = /\d/.test(sanitized);
	const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(sanitized);
	
	if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
		return { 
			password: sanitized, 
			isValid: false, 
			error: 'Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais' 
		};
	}
	
	return { password: sanitized, isValid: true };
}

/**
 * Prepara dados para envio seguro
 */
export function prepareSafePayload(data: any): any {
	const sanitized: any = {};
	
	for (const key in data) {
		if (typeof data[key] === 'string') {
			sanitized[key] = sanitizeInput(data[key]);
		} else {
			sanitized[key] = data[key];
		}
	}
	
	return sanitized;
}