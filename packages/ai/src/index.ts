import { streamText, type ModelMessage, type StreamTextResult } from "ai";

export type { ModelMessage };

export type StreamChatOptions = {
	messages: ModelMessage[];
	model?: string;
	temperature?: number;
	maxOutputTokens?: number;
};

export const defaultChatModel = process.env.AI_MODEL ?? "openai/gpt-4o-mini";

export const streamChat = ({
	messages,
	model = defaultChatModel,
	temperature = 0.7,
	maxOutputTokens = 1000,
}: StreamChatOptions): StreamTextResult<any, any> => {
	return streamText({
		model,
		messages,
		temperature,
		maxOutputTokens,
	});
};
