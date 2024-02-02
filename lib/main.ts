import { checkIfPasswordHasBeenPwned } from "./hibp";

export type PasswordErrorCode =
	| "MIN_CHARS_NOT_MET"
	| "ENTROPY_TOO_LOW"
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
	errorCode?: PasswordErrorCode;
	strength: PasswordStrength;
	strengthLevel: PasswordStrengthLevel;
	entropy: number;
};

export type TestPasswordOptions = {
	enableEntropyLowerBound?: boolean;
	enableReUsedPasswordCheck?: boolean;
};

function mapStrengthLevelToEnum(level: number) {
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

function calculatePasswordEntropy(password: string) {
	const charsetSize = new Set(password).size;

	const entropy = Math.log2(charsetSize ** password.length);
	return entropy;
}

function calculateStrengthLevel(entropy: number): PasswordStrengthLevel {
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

function getOptions(options: TestPasswordOptions | undefined) {
	const enableEntropyLowerBound = options?.enableEntropyLowerBound ?? true;
	const enableReUsedPasswordCheck = options?.enableReUsedPasswordCheck ?? true;
	return {
		enableEntropyLowerBound,
		enableReUsedPasswordCheck,
	};
}

export async function testPassword(
	password: string,
	options?: TestPasswordOptions,
): Promise<PasswordReport> {
	if (typeof password !== "string") {
		throw new Error("Password must be string");
	}

	const { enableEntropyLowerBound, enableReUsedPasswordCheck } =
		getOptions(options);

	const LOWER_ALLOWED_ENTROPY = 25;

	const entropy = calculatePasswordEntropy(password);

	if (password.length < 8) {
		return {
			errorCode: "MIN_CHARS_NOT_MET",
			strength: "ERROR",
			strengthLevel: 0,
			entropy,
		};
	}

	if (enableEntropyLowerBound && entropy <= LOWER_ALLOWED_ENTROPY) {
		return {
			errorCode: "ENTROPY_TOO_LOW",
			strength: "ERROR",
			strengthLevel: 0,
			entropy,
		};
	}

	let errorCode: PasswordErrorCode | undefined;
	if (enableReUsedPasswordCheck) {
		try {
			const hasBeenPreviouslyPwned =
				await checkIfPasswordHasBeenPwned(password);
			if (hasBeenPreviouslyPwned) {
				return {
					strength: "POOR",
					strengthLevel: 1,
					entropy,
				};
			}
		} catch (e) {
			errorCode = "FAILED_TO_CHECK_PASSWORD_REUSE";
		}
	}

	const strengthLevel = calculateStrengthLevel(entropy);

	const result: PasswordReport = {
		strength: mapStrengthLevelToEnum(strengthLevel),
		strengthLevel: strengthLevel,
		entropy,
	};
	if (errorCode) {
		result.errorCode = errorCode;
	}
	return result;
}
