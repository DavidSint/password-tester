import { MockedFunction, afterEach, describe, expect, test, vi } from "vitest";
import { checkIfPasswordHasBeenPwned } from "../hibp";

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
