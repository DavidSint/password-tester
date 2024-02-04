import { MockedFunction, describe, expect, test, vi } from "vitest";
import { checkIfPasswordHasBeenPwned, createSha1Hash } from "../hibp";

describe("Have I Been Pwned", () => {
	test("password been reused", async () => {
		expect(await checkIfPasswordHasBeenPwned("password")).toBe(true);
	});
	test("password not been reused", async () => {
		expect(
			await checkIfPasswordHasBeenPwned("123934534fjsdkfsjl; mnlpdfs£@!^$&$"),
		).toBe(false);
	});
	test("throw an error if unable to access Have I Been Pwned", async () => {
		const fetchSafeBox = global.fetch;
		global.fetch = vi.fn();

		(fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
			ok: false,
		} as Response);

		await expect(checkIfPasswordHasBeenPwned("password123")).rejects.toThrow(
			"Unable to access Have I Been Pwned",
		);

		global.fetch = fetchSafeBox;
	});
});

describe("createSha1 Tests", () => {
	test("non-node web crypto API hash", async () => {
		const cryptoSafeBox = globalThis.crypto;

		Object.defineProperty(globalThis, "crypto", {
			value: {
				getRandomValues: vi
					.fn()
					.mockImplementation(async () => new ArrayBuffer(16)),
				randomUUID: vi.fn() as MockedFunction<typeof cryptoSafeBox.randomUUID>,
				subtle: {
					...cryptoSafeBox?.subtle,
					digest: vi.fn().mockImplementation(async () => new ArrayBuffer(16)),
				},
			},
			writable: true,
		});

		const referenceError = (() => {
			try {
				// Attempting to access an undefined variable, which will throw a ReferenceError to use
				// @ts-ignore
				console.log(undefinedVariable);
			} catch (error) {
				return error as ReferenceError;
			}
		})();

		await createSha1Hash(
			"123934534f",
			referenceError as unknown as NodeJS.Process,
		);

		expect(globalThis.crypto.subtle.digest).toHaveBeenCalled();

		globalThis.crypto = cryptoSafeBox;
	});
});
