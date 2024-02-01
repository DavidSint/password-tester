export type PasswordErrorCode = "MIN_CHARS_NOT_MET" | "ENTROPY_TOO_LOW";

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
	disableEntropyLowerBound: boolean;
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

export function testPassword(
	password: string,
	options?: TestPasswordOptions,
): PasswordReport {
	if (typeof password !== "string") {
		throw new Error("Password must be string");
	}

	const LOWER_ALLOWED_ENTROPY = 25;
	const charsetSize = new Set(password).size;

	const entropy = Math.log2(charsetSize ** password.length);

	if (password.length < 8) {
		return {
			errorCode: "MIN_CHARS_NOT_MET",
			strength: "ERROR",
			strengthLevel: 0,
			entropy,
		};
	}

	if (!options?.disableEntropyLowerBound && entropy <= LOWER_ALLOWED_ENTROPY) {
		return {
			errorCode: "ENTROPY_TOO_LOW",
			strength: "ERROR",
			strengthLevel: 0,
			entropy,
		};
	}

	let strengthLevel: PasswordStrengthLevel = 1; // POOR
	if (entropy >= 100) {
		strengthLevel = 5; // EXCELLENT
	} else if (entropy >= 80) {
		strengthLevel = 4; // VERY GOOD
	} else if (entropy >= 60) {
		strengthLevel = 3; // GOOD
	} else if (entropy > 30) {
		strengthLevel = 2; // FAIR
	}

	return {
		strength: mapStrengthLevelToEnum(strengthLevel),
		strengthLevel: strengthLevel,
		entropy,
	};
}
