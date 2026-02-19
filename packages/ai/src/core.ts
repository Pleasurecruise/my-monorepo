import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createPrefixedId } from "@my-monorepo/utils/ids";
import { streamText } from "ai";

import type { StreamChatOptions, StreamChatResult } from "./types.js";

export const defaultChatModel = process.env.OPENAI_MODEL ?? "deepseek-ai/DeepSeek-V3";

export const isAiConfigured = () =>
	Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_URL);

export const createStreamId = (prefix = "stream") => createPrefixedId(prefix);

let provider: ReturnType<typeof createOpenAICompatible> | null = null;

const getProvider = () => {
	const apiKey = process.env.OPENAI_API_KEY;
	const baseURL = process.env.OPENAI_API_URL;

	if (!apiKey) {
		throw new Error("OPENAI_API_KEY is required");
	}

	if (!baseURL) {
		throw new Error("OPENAI_API_URL is required");
	}

	if (!provider) {
		provider = createOpenAICompatible({
			name: "openai-compatible",
			baseURL,
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});
	}

	return provider;
};

export const streamChat = ({
	messages,
	model = defaultChatModel,
	temperature = 0.7,
	maxOutputTokens = 1000,
}: StreamChatOptions): StreamChatResult => {
	return streamText({
		model: getProvider()(model),
		messages,
		temperature,
		maxOutputTokens,
	});
};
