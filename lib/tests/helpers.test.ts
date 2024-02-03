import { describe, expect, test } from "vitest";
import { mapStrengthLevelToEnum } from "../helpers";

describe("Map Strength Level To Enum", () => {
	test("Less than 1 (0) returns ERROR", () => {
		expect(mapStrengthLevelToEnum(0)).toBe("ERROR");
	});
});
