import type { AsyncIterableStream, ModelMessage } from "ai";
import type {
	createResumableStreamContext as createResumableStreamContextBase,
	Publisher,
	ResumableStreamContext,
	Subscriber,
} from "resumable-stream";

export type { ModelMessage, Publisher, ResumableStreamContext, Subscriber };

export type StreamChatOptions = {
	messages: ModelMessage[];
	model?: string;
	temperature?: number;
	maxOutputTokens?: number;
};

export type StreamChatResult = {
	textStream: AsyncIterableStream<string>;
};

type BaseResumableStreamContextOptions = Parameters<typeof createResumableStreamContextBase>[0];

export type ResumableStreamContextOptions = Omit<BaseResumableStreamContextOptions, "waitUntil"> & {
	waitUntil?: BaseResumableStreamContextOptions["waitUntil"];
};

export type WaitUntil = BaseResumableStreamContextOptions["waitUntil"];

export type TextStream = AsyncIterable<string>;

export type ResumableChatOptions = StreamChatOptions & {
	streamId: string;
	resumeAt?: number;
	streamContext: ResumableStreamContext;
};

export type ResumableChatResult = {
	stream: TextStream | null;
};
