import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
	getSharedRedisPublisher,
	getSharedRedisSubscriber,
	isRedisConfigured,
} from "@my-monorepo/memory";
import { createPrefixedId } from "@my-monorepo/utils/ids";
import { streamText } from "ai";
import { createResumableStreamContext as createResumableStreamContextBase } from "resumable-stream";

import type {
	ResumableChatOptions,
	ResumableChatResult,
	ResumableStreamContext,
	ResumableStreamContextOptions,
	StreamChatOptions,
	StreamChatResult,
	WaitUntil,
} from "./types.js";

export const defaultChatModel = process.env.OPENAI_MODEL ?? "deepseek-ai/DeepSeek-V3";

export const isAiConfigured = () =>
	Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_URL);

export const isResumableStreamConfigured = () => isRedisConfigured();

export const createStreamId = (prefix = "stream") => createPrefixedId(prefix);

const defaultWaitUntil: NonNullable<WaitUntil> = (promise) => {
	void promise;
};

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

type BaseResumableStreamContextOptions = Parameters<typeof createResumableStreamContextBase>[0];

type ResumableStreamContextOptionsWithWaitUntil = Omit<
	ResumableStreamContextOptions,
	"waitUntil"
> & {
	waitUntil: NonNullable<WaitUntil> | null;
};

const withSharedRedisOptions = (
	options: ResumableStreamContextOptionsWithWaitUntil,
): BaseResumableStreamContextOptions => {
	if (options.publisher || options.subscriber || !isRedisConfigured()) {
		return options;
	}

	return {
		...options,
		publisher: getSharedRedisPublisher(),
		subscriber: getSharedRedisSubscriber(),
	};
};

export const createResumableStreamContext = (options: ResumableStreamContextOptions = {}) =>
	createResumableStreamContextBase(
		withSharedRedisOptions({
			...options,
			waitUntil: options.waitUntil === undefined ? defaultWaitUntil : options.waitUntil,
		}),
	);

export const getResumableStreamContext = (options?: ResumableStreamContextOptions) => {
	if (!options?.publisher && !options?.subscriber && !isResumableStreamConfigured()) {
		return null;
	}

	return createResumableStreamContext(options);
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

const readableStreamToAsyncIterable = (stream: ReadableStream<string>): AsyncIterable<string> => ({
	[Symbol.asyncIterator]() {
		const reader = stream.getReader();

		return {
			async next() {
				const { done, value } = await reader.read();
				if (done) {
					reader.releaseLock();
					return { done: true, value: undefined };
				}

				return { done: false, value };
			},
			async return() {
				reader.releaseLock();
				return { done: true, value: undefined };
			},
		};
	},
});

export const streamChatResumable = async ({
	streamContext,
	streamId,
	resumeAt,
	...options
}: ResumableChatOptions): Promise<ResumableChatResult> => {
	const stream = await streamContext.resumableStream(
		streamId,
		() => streamChat(options).textStream,
		resumeAt,
	);

	return { stream: stream ? readableStreamToAsyncIterable(stream) : null };
};

export const resumeChatStream = async ({
	streamContext,
	streamId,
	resumeAt,
}: {
	streamContext: ResumableStreamContext;
	streamId: string;
	resumeAt: number;
}): Promise<ResumableChatResult> => {
	const stream = await streamContext.resumeExistingStream(streamId, resumeAt);

	if (!stream) {
		return { stream: null };
	}

	return { stream: readableStreamToAsyncIterable(stream) };
};
