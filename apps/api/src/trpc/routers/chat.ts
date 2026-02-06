import {
	createStreamId,
	getResumableStreamContext,
	isAiConfigured,
	resumeChatStream,
	streamChat,
	streamChatResumable,
	type ModelMessage,
} from "@my-monorepo/ai";
import { createLoggerWithContext } from "@my-monorepo/logger";
import { z } from "@my-monorepo/utils";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/trpc/init";

type MessageStatus = "streaming" | "done" | "error";

type StreamChunk = {
	streamId: string;
	status: MessageStatus;
	text: string;
	resumeAt?: number;
	resumable: boolean;
};

const logger = createLoggerWithContext("api:chat");

let cachedStreamContext: ReturnType<typeof getResumableStreamContext> | undefined;

const getStreamContext = () => {
	if (cachedStreamContext !== undefined) {
		return cachedStreamContext;
	}

	try {
		cachedStreamContext = getResumableStreamContext();
	} catch (error) {
		logger.warn(
			"Failed to initialize resumable stream context",
			error instanceof Error ? { error } : { error },
		);
		cachedStreamContext = null;
	}

	return cachedStreamContext;
};

const chatMessageSchema = z.object({
	role: z.enum(["user", "assistant", "system"]),
	content: z.string(),
});

export const chatRouter = createTRPCRouter({
	// TODO: Replace with protectedProcedure once auth is implemented.
	sendMessage: publicProcedure
		.input(
			z
				.object({
					messages: z.array(chatMessageSchema).optional(),
					streamId: z.string().optional(),
					resumeAt: z.number().int().nonnegative().optional(),
				})
				.refine(
					(value) =>
						Boolean(value.messages && value.messages.length > 0) ||
						(Boolean(value.streamId) && value.resumeAt !== undefined),
					{
						message: "messages or resume info is required",
					},
				),
		)
		.mutation(async function* ({ input }): AsyncGenerator<StreamChunk> {
			if (!isAiConfigured()) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "服务器配置错误：缺少AI配置",
				});
			}

			const streamContext = getStreamContext();
			const resumableEnabled = Boolean(streamContext);
			const hasMessages = Boolean(input.messages && input.messages.length > 0);
			const streamId = input.streamId ?? createStreamId("assistant");
			const resumeAt = input.resumeAt ?? 0;

			try {
				if (!hasMessages && (!input.streamId || input.resumeAt === undefined)) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "缺少消息内容或续传参数",
					});
				}

				if (!resumableEnabled && (input.streamId || input.resumeAt !== undefined)) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "服务器未启用断点续传",
					});
				}

				let stream: AsyncIterable<string> | null;

				if (streamContext) {
					if (hasMessages) {
						const result = await streamChatResumable({
							streamContext,
							streamId,
							resumeAt: input.resumeAt,
							messages: input.messages as ModelMessage[],
						});
						stream = result.stream;
					} else {
						const result = await resumeChatStream({
							streamContext,
							streamId,
							resumeAt,
						});
						stream = result.stream;
					}
				} else {
					const result = streamChat({
						messages: input.messages as ModelMessage[],
					});
					stream = result.textStream;
				}

				if (!stream) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "续传流不存在或已过期",
					});
				}

				let cursor = input.resumeAt ?? 0;

				for await (const text of stream) {
					cursor += text.length;
					yield {
						streamId,
						status: "streaming",
						text,
						resumeAt: cursor,
						resumable: resumableEnabled,
					};
				}

				yield { streamId, status: "done", text: "", resumeAt: cursor, resumable: resumableEnabled };
			} catch (error) {
				logger.error("AI stream error", error instanceof Error ? { error } : { error });
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "AI服务出现错误，请稍后再试",
				});
			}
		}),
});
