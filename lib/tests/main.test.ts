import { MockedFunction, describe, expect, test, vi } from "vitest";
import { testPassword } from "../main";

describe("Entropy Scenarios", () => {
	test('only alphabetical "test" entropy', async () => {
		expect(
			(await testPassword("test", { enableReUsedPasswordCheck: false }))
				.entropy,
		).toBe(6.339850002884624);
	});
	test('alphanumeric "test123" entropy', async () => {
		expect(
			(await testPassword("test123", { enableReUsedPasswordCheck: false }))
				.entropy,
		).toBe(18.094737505048094);
	});
	test('alphanumeric and symbol "test123!" entropy', async () => {
		expect(
			(await testPassword("test123!", { enableReUsedPasswordCheck: false }))
				.entropy,
		).toBe(22.458839376460833);
	});
	test('alphanumeric and symbols "test123!@" entropy', async () => {
		expect(
			(await testPassword("test123!@", { enableReUsedPasswordCheck: false }))
				.entropy,
		).toBe(27);
	});
	test('alphanumeric, symbols and emoji "test123!@a❤️" entropy', async () => {
		expect(
			(await testPassword("test123!@a❤️", { enableReUsedPasswordCheck: false }))
				.entropy,
		).toBe(41.513179423647564);
	});
	test("same chars repeated has incremental entropy", async () => {
		const singleCharEntropy = (
			await testPassword("12", { enableReUsedPasswordCheck: false })
		).entropy;
		const doubleCharEntropy = (
			await testPassword("121", { enableReUsedPasswordCheck: false })
		).entropy;
		const tripleCharEntropy = (
			await testPassword("1212", { enableReUsedPasswordCheck: false })
		).entropy;

		expect(doubleCharEntropy).toBe(singleCharEntropy + 1);
		expect(tripleCharEntropy).toBe(doubleCharEntropy + 1);
	});
});

describe("Strength Level", () => {
	test("poor strength level", async () => {
		const poorStrengthLevelReport = await testPassword("abcdefghi", {
			enableReUsedPasswordCheck: false,
		});
		expect(poorStrengthLevelReport.entropy).toBeLessThan(30);
		expect(poorStrengthLevelReport).toMatchObject({
			strength: "POOR",
			strengthLevel: 1,
		});
	});
	test("fair strength level", async () => {
		const fairStrengthLevelReport = await testPassword("abcdefghij", {
			enableReUsedPasswordCheck: false,
		});
		expect(fairStrengthLevelReport.entropy).toBeGreaterThan(30);
		expect(fairStrengthLevelReport.entropy).toBeLessThan(60);
		expect(fairStrengthLevelReport).toMatchObject({
			strength: "FAIR",
			strengthLevel: 2,
		});
	});
	test("good strength level", async () => {
		const goodStrengthLevelReport = await testPassword("abcdefghijklmnopqr", {
			enableReUsedPasswordCheck: false,
		});
		expect(goodStrengthLevelReport.entropy).toBeGreaterThanOrEqual(60);
		expect(goodStrengthLevelReport.entropy).toBeLessThan(80);
		expect(goodStrengthLevelReport).toMatchObject({
			strength: "GOOD",
			strengthLevel: 3,
		});
	});
	test("very good strength level", async () => {
		const veryGoodStrengthLevelReport = await testPassword(
			"abcdefghijklmnopqrstuv",
			{ enableReUsedPasswordCheck: false },
		);
		expect(veryGoodStrengthLevelReport.entropy).toBeGreaterThanOrEqual(80);
		expect(veryGoodStrengthLevelReport.entropy).toBeLessThan(100);
		expect(veryGoodStrengthLevelReport).toMatchObject({
			strength: "VERY_GOOD",
			strengthLevel: 4,
		});
	});
	test("excellent strength level", async () => {
		const excellentStrengthLevelReport = await testPassword(
			"abcdefghijklmnopqrstuvw",
			{ enableReUsedPasswordCheck: false },
		);
		expect(excellentStrengthLevelReport.entropy).toBeGreaterThan(100);
		expect(excellentStrengthLevelReport).toMatchObject({
			strength: "EXCELLENT",
			strengthLevel: 5,
		});
	});
});

describe("Rule Error Scenarios", () => {
	test("less than 8 characters", async () => {
		const minCharsNotMetPasswordReport = await testPassword("test123", {
			enableReUsedPasswordCheck: false,
		});
		expect(minCharsNotMetPasswordReport).toEqual({
			errorCode: "MIN_CHARS_NOT_MET",
			strength: "ERROR",
			strengthLevel: 0,
			entropy: 18.094737505048094,
		});
	});
	test("blank password", async () => {
		const minCharsNotMetPasswordReport = await testPassword("", {
			enableReUsedPasswordCheck: false,
		});
		expect(minCharsNotMetPasswordReport).toEqual({
			errorCode: "MIN_CHARS_NOT_MET",
			strength: "ERROR",
			strengthLevel: 0,
			entropy: 0,
		});
	});
	test("low entropy password", async () => {
		const lowEntropyPasswordReport = await testPassword("abcdefgh", {
			enableReUsedPasswordCheck: false,
		});
		expect(lowEntropyPasswordReport).toEqual({
			errorCode: "ENTROPY_TOO_LOW",
			strength: "ERROR",
			strengthLevel: 0,
			entropy: 24,
		});
	});
	test("low entropy password", async () => {
    const fetchSafeBox = global.fetch;
		global.fetch = vi.fn();

		(fetch as MockedFunction<typeof fetch>).mockResolvedValueOnce({
			ok: false,
		} as Response);

		const reusedPasswordReportWithError = await testPassword("password123");

		expect(reusedPasswordReportWithError).toEqual({
			errorCode: "FAILED_TO_CHECK_PASSWORD_REUSE",
			strength: "FAIR",
			strengthLevel: 2,
			entropy: 36.541209043760986,
		});

		global.fetch = fetchSafeBox;
	});
	test("no errorCode if no errors", async () => {
		const report = await testPassword("abcdefghijklmnopqrstuvw", {
			enableReUsedPasswordCheck: false,
		});
		expect(report.errorCode).toBeUndefined();
	});
});

describe("Thrown Error Scenarios", () => {
	test("password must be string", async () => {
		const res = async () =>
			await testPassword({ test: 1 } as unknown as string);
		expect(res).rejects.toThrowError("Password must be string");
	});
});

describe("Re-Used Password Check", () => {
  test("password is POOR if reused", async () => {
		const report = await testPassword(
			"password123"
		);
		expect(report).toMatchObject({
			strength: "POOR",
			strengthLevel: 1,
		});
	});
})