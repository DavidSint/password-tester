export type PasswordErrorCode =
	| "MIN_CHARS_NOT_MET"
	| "ENTROPY_TOO_LOW"
	| "FAILED_TO_CHECK_PASSWORD_REUSE";

export type PasswordWarningCode =
	| "PASSWORD_PREVIOUSLY_EXPOSED"
	| "FAILED_TO_CHECK_PASSWORD_REUSE";

export type PasswordStrength =
	| "EXCELLENT"
	| "VERY_GOOD"
	| "GOOD"
	| "FAIR"
	| "POOR"
	| "ERROR";

export type PasswordStrengthLevel = 5 | 4 | 3 | 2 | 1 | 0;

export type PasswordReport = {
	strength: PasswordStrength;
	strengthLevel: PasswordStrengthLevel;
	entropy: number;
	warningCode?: PasswordWarningCode;
	errorCode?: PasswordErrorCode;
};

export type TestPasswordOptions = {
	enableEntropyLowerBound?: boolean;
	enableReUsedPasswordCheck?: boolean;
	requireReUsedPasswordCheckSuccess?: boolean;
};

type CalculatedTestPasswordOptions = {
	enableEntropyLowerBound?: boolean;
	enableReUsedPasswordCheck?: boolean;
	requireReUsedPasswordCheckSuccess?: boolean;
};

export function mapStrengthLevelToEnum(level: number): PasswordStrength {
	if (level >= 5) {
		return "EXCELLENT";
	}
	if (level === 4) {
		return "VERY_GOOD";
	}
	if (level === 3) {
		return "GOOD";
	}
	if (level === 2) {
		return "FAIR";
	}
	if (level === 1) {
		return "POOR";
	}
	return "ERROR";
}

export function calculatePasswordEntropy(password: string): number {
	const charsetSize = new Set(password).size;

	const entropy = Math.log2(charsetSize ** password.length);
	return entropy;
}

export function calculateStrengthLevel(entropy: number): PasswordStrengthLevel {
	if (entropy >= 100) {
		return 5; // EXCELLENT
	}
	if (entropy >= 80) {
		return 4; // VERY GOOD
	}
	if (entropy >= 60) {
		return 3; // GOOD
	}
	if (entropy > 30) {
		return 2; // FAIR
	}
	return 1; // POOR
}

export function getOptions(
	options: TestPasswordOptions | undefined,
): CalculatedTestPasswordOptions {
	const enableEntropyLowerBound = options?.enableEntropyLowerBound ?? true;
	const enableReUsedPasswordCheck = options?.enableReUsedPasswordCheck ?? true;
	const requireReUsedPasswordCheckSuccess =
		options?.requireReUsedPasswordCheckSuccess ?? true;
	return {
		enableEntropyLowerBound,
		enableReUsedPasswordCheck,
		requireReUsedPasswordCheckSuccess,
	};
}
