import { describe, expect, it } from "vitest";
import {
	createResumableStreamContext,
	createStreamId,
	defaultChatModel,
	resumeChatStream,
	streamChat,
	streamChatResumable,
} from "./index.js";

describe("ai package", () => {
	it("exports a default model string", () => {
		expect(typeof defaultChatModel).toBe("string");
	});

	it("exports the streamChat helper", () => {
		expect(typeof streamChat).toBe("function");
	});

	it("creates stream ids with a prefix", () => {
		const streamId = createStreamId("chat");
		expect(streamId.startsWith("chat_")).toBe(true);
	});

	it("exports resumable stream helpers", () => {
		expect(typeof createResumableStreamContext).toBe("function");
		expect(typeof streamChatResumable).toBe("function");
		expect(typeof resumeChatStream).toBe("function");
	});
});
