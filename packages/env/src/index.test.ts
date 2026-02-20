import { describe, expect, it } from "vitest";
import { schema } from "./schema.js";

describe("env schema", () => {
	it("should validate a valid environment", () => {
		const validEnv = {
			DATABASE_URL: "postgresql://localhost:5432/db",
			BETTER_AUTH_URL: "http://localhost:3000",
			BETTER_AUTH_SECRET: "secret",
		};

		const result = schema.safeParse(validEnv);
		expect(result.success).toBe(true);
	});

	it("should fail on invalid environment", () => {
		const invalidEnv = {
			DATABASE_URL: "not-a-url",
		};

		const result = schema.safeParse(invalidEnv);
		expect(result.success).toBe(false);
	});

	it("should use default values", () => {
		const minimalEnv = {
			DATABASE_URL: "postgresql://localhost:5432/db",
			BETTER_AUTH_URL: "http://localhost:3000",
			BETTER_AUTH_SECRET: "secret",
		};

		const result = schema.parse(minimalEnv);
		expect(result.LOG_LEVEL).toBe("info");
		expect(result.PORT).toBe(5173);
	});
});
