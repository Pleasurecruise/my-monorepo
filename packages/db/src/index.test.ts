import { describe, expect, it } from "vitest";
import { prisma } from "./index.js";

describe("db exports", () => {
	it("should export prisma client", () => {
		expect(prisma).toBeDefined();
	});
});
