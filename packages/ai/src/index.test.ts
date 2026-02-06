import { describe, expect, it } from "vitest";
import { defaultChatModel, streamChat } from "./index.js";

describe("ai package", () => {
	it("exports a default model string", () => {
		expect(typeof defaultChatModel).toBe("string");
	});

	it("exports the streamChat helper", () => {
		expect(typeof streamChat).toBe("function");
	});
});
