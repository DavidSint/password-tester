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

		await createSha1Hash("123934534f");

		expect(globalThis.crypto.subtle.digest).toHaveBeenCalled();

		globalThis.crypto = cryptoSafeBox;
	});

  test("node web crypto API hash", async () => {
		const hash = await createSha1Hash("123934534f");
    expect(hash).toBe('180ecb35aebc323070f67bb14a5eced920e6d242')
	});
});
