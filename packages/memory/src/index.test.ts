import { describe, expect, it } from "vitest";
import { RedisCache, isRedisConfigured } from "./index.js";

describe("memory package", () => {
	it("exposes RedisCache class", () => {
		const cache = new RedisCache("test");
		expect(cache).toBeInstanceOf(RedisCache);
	});

	it("reports redis configuration state", () => {
		expect(typeof isRedisConfigured()).toBe("boolean");
	});
});
