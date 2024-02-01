import { describe, expect, test } from "vitest";
import { testPassword } from "./main";

describe("Entropy Scenarios", () => {
	test('only alphabetical "test" entropy', () => {
		expect(testPassword("test").entropy).toBe(6.339850002884624);
	});
	test('alphanumeric "test123" entropy', () => {
		expect(testPassword("test123").entropy).toBe(18.094737505048094);
	});
	test('alphanumeric and symbol "test123!" entropy', () => {
		expect(testPassword("test123!").entropy).toBe(22.458839376460833);
	});
	test('alphanumeric and symbols "test123!@" entropy', () => {
		expect(testPassword("test123!@").entropy).toBe(27);
	});
	test('alphanumeric, symbols and emoji "test123!@a❤️" entropy', () => {
		expect(testPassword("test123!@a❤️").entropy).toBe(41.513179423647564);
	});
	test("same chars repeated has incremental entropy", () => {
		const singleCharEntropy = testPassword("12").entropy;
		const doubleCharEntropy = testPassword("121").entropy;
		const tripleCharEntropy = testPassword("1212").entropy;

		expect(doubleCharEntropy).toBe(singleCharEntropy + 1);
		expect(tripleCharEntropy).toBe(doubleCharEntropy + 1);
	});
});

describe("Strength Level", () => {
	test("poor strength level", () => {
		const poorStrengthLevelReport = testPassword("abcdefghi");
		expect(poorStrengthLevelReport.entropy).toBeLessThan(30);
		expect(poorStrengthLevelReport).toMatchObject({
			strength: "POOR",
			strengthLevel: 1,
		});
	});
	test("fair strength level", () => {
		const fairStrengthLevelReport = testPassword("abcdefghij");
		expect(fairStrengthLevelReport.entropy).toBeGreaterThan(30);
		expect(fairStrengthLevelReport.entropy).toBeLessThan(60);
		expect(fairStrengthLevelReport).toMatchObject({
			strength: "FAIR",
			strengthLevel: 2,
		});
	});
	test("good strength level", () => {
		const goodStrengthLevelReport = testPassword("abcdefghijklmnopqr");
		expect(goodStrengthLevelReport.entropy).toBeGreaterThanOrEqual(60);
		expect(goodStrengthLevelReport.entropy).toBeLessThan(80);
		expect(goodStrengthLevelReport).toMatchObject({
			strength: "GOOD",
			strengthLevel: 3,
		});
	});
	test("very good strength level", () => {
		const veryGoodStrengthLevelReport = testPassword("abcdefghijklmnopqrstuv");
		expect(veryGoodStrengthLevelReport.entropy).toBeGreaterThanOrEqual(80);
		expect(veryGoodStrengthLevelReport.entropy).toBeLessThan(100);
		expect(veryGoodStrengthLevelReport).toMatchObject({
			strength: "VERY_GOOD",
			strengthLevel: 4,
		});
	});
	test("excellent strength level", () => {
		const excellentStrengthLevelReport = testPassword(
			"abcdefghijklmnopqrstuvw",
		);
		expect(excellentStrengthLevelReport.entropy).toBeGreaterThan(100);
		expect(excellentStrengthLevelReport).toMatchObject({
			strength: "EXCELLENT",
			strengthLevel: 5,
		});
	});
});

describe("Rule Error Scenarios", () => {
	test("less than 8 characters", () => {
		const minCharsNotMetPasswordReport = testPassword("test123");
		expect(minCharsNotMetPasswordReport).toEqual({
			errorCode: "MIN_CHARS_NOT_MET",
			strength: "ERROR",
			strengthLevel: 0,
			entropy: 18.094737505048094,
		});
	});
	test("blank password", () => {
		const minCharsNotMetPasswordReport = testPassword("");
		expect(minCharsNotMetPasswordReport).toEqual({
			errorCode: "MIN_CHARS_NOT_MET",
			strength: "ERROR",
			strengthLevel: 0,
			entropy: 0,
		});
	});
	test("low entropy password", () => {
		const lowEntropyPasswordReport = testPassword("abcdefgh");
		expect(lowEntropyPasswordReport).toEqual({
			errorCode: "ENTROPY_TOO_LOW",
			strength: "ERROR",
			strengthLevel: 0,
			entropy: 24,
		});
	});
});

describe("Thrown Error Scenarios", () => {
	test("password must be string", () => {
		expect(() => testPassword({ test: 1 } as unknown as string)).toThrowError(
			"Password must be string",
		);
	});
});
