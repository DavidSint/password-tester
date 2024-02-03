import {
	PasswordErrorCode,
	PasswordReport,
	TestPasswordOptions,
	calculatePasswordEntropy,
	calculateStrengthLevel,
	getOptions,
	mapStrengthLevelToEnum,
} from "./helpers";
import { checkIfPasswordHasBeenPwned } from "./hibp";

export async function testPassword(
	password: string,
	options?: TestPasswordOptions,
): Promise<PasswordReport> {
	if (typeof password !== "string") {
		throw new Error("Password must be string");
	}

	const {
		enableEntropyLowerBound,
		enableReUsedPasswordCheck,
		requireReUsedPasswordCheckSuccess,
	} = getOptions(options);

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
			if (requireReUsedPasswordCheckSuccess) {
				return {
					errorCode,
					strength: "ERROR",
					strengthLevel: 0,
					entropy,
				};
			}
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
