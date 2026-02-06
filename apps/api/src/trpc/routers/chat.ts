import { z } from "@my-monorepo/utils";
import { TRPCError } from "@trpc/server";
import { streamChat, type ModelMessage } from "@my-monorepo/ai";
import { createTRPCRouter, protectedProcedure } from "../init";

type MessageStatus = "streaming" | "done" | "error";

type StoredMessage = {
	id: string;
	content: string;
	status: MessageStatus;
	createdAt: number;
};

type StreamChunk = {
	messageId: string;
	status: MessageStatus;
	text: string;
};

const STREAM_CHUNK_SIZE = 6;
const POLL_INTERVAL_MS = 50;

const storedMessages = new Map<string, StoredMessage>();

const hasGatewayAuth = Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);

if (!hasGatewayAuth) {
	console.error("AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN is not set in environment variables");
}

const chatMessageSchema = z.object({
	role: z.enum(["user", "assistant", "system"]),
	content: z.string(),
});

const resumeSchema = z.object({
	messageId: z.string(),
	currentContent: z.string(),
});

const generateId = (prefix: string) =>
	`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const chunkText = (text: string, size: number) => {
	const chunks: string[] = [];
	for (let i = 0; i < text.length; i += size) {
		chunks.push(text.slice(i, i + size));
	}
	return chunks;
};

const createAiStream = (messages: ModelMessage[]) => {
	const model = process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? "openai/gpt-4o-mini";

	const result = streamChat({
		messages,
		model,
	});

	return result.textStream;
};

const consumeStream = (stream: ReadableStream<string>, message: StoredMessage) => {
	(async () => {
		const reader = stream.getReader();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				message.content += value;
			}
			message.status = "done";
		} catch (error) {
			message.status = "error";
			console.error("AI stream error:", error);
		} finally {
			reader.releaseLock();
		}
	})();
};

async function* convertReadableStreamToAsyncIterable(
	stream: ReadableStream<string>,
	messageId: string,
): AsyncGenerator<StreamChunk> {
	const reader = stream.getReader();
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			yield {
				messageId,
				status: "streaming",
				text: value,
			};
		}
		yield { messageId, status: "done", text: "" };
	} finally {
		reader.releaseLock();
	}
}

async function* pollMessage(
	message: StoredMessage,
	startIndex: number,
): AsyncGenerator<StreamChunk> {
	let cursor = Math.min(startIndex, message.content.length);

	while (true) {
		if (cursor < message.content.length) {
			const delta = message.content.slice(cursor);
			for (const chunk of chunkText(delta, STREAM_CHUNK_SIZE)) {
				yield {
					messageId: message.id,
					status: "streaming",
					text: chunk,
				};
			}
			cursor = message.content.length;
		}

		if (message.status === "done") {
			yield { messageId: message.id, status: "done", text: "" };
			break;
		}

		if (message.status === "error") {
			yield { messageId: message.id, status: "error", text: "" };
			break;
		}

		await sleep(POLL_INTERVAL_MS);
	}
}

export const chatRouter = createTRPCRouter({
	sendMessage: protectedProcedure
		.input(
			z.object({
				messages: z.array(chatMessageSchema),
			}),
		)
		.mutation(async function* ({ input }): AsyncGenerator<StreamChunk> {
			if (!hasGatewayAuth) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "服务器配置错误：缺少AI Gateway鉴权信息",
				});
			}

			const assistantMessage: StoredMessage = {
				id: generateId("assistant"),
				content: "",
				status: "streaming",
				createdAt: Date.now(),
			};

			storedMessages.set(assistantMessage.id, assistantMessage);

			try {
				const readableStream = createAiStream(input.messages);
				const [streamForStore, streamForClient] = readableStream.tee();

				consumeStream(streamForStore, assistantMessage);

				yield* convertReadableStreamToAsyncIterable(streamForClient, assistantMessage.id);
			} catch (error) {
				assistantMessage.status = "error";
				console.error("AI SDK error:", error);

				if (error instanceof Error) {
					if (error.message.includes("401") || error.message.includes("无效的令牌")) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "AI鉴权无效或已过期，请联系管理员检查配置",
						});
					}

					if (error.message.includes("429")) {
						throw new TRPCError({
							code: "TOO_MANY_REQUESTS",
							message: "AI请求频率过高，请稍后再试",
						});
					}

					if (
						error.message.includes("500") ||
						error.message.includes("502") ||
						error.message.includes("503")
					) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "AI服务暂时不可用，请稍后再试",
						});
					}
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "AI服务出现错误，请稍后再试",
				});
			}
		}),
	resumeMessage: protectedProcedure.input(resumeSchema).mutation(async function* ({
		input,
	}): AsyncGenerator<StreamChunk> {
		const message = storedMessages.get(input.messageId);

		if (!message) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "消息不存在或已过期",
			});
		}

		const startIndex = input.currentContent.length;
		yield* pollMessage(message, startIndex);
	}),
});
