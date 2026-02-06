import "@/load-env";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "@/trpc/init";
import { chatRouter } from "@/trpc/routers/chat";
import { helloRouter } from "@/trpc/routers/hello";

export const appRouter = createTRPCRouter({
	chat: chatRouter,
	hello: helloRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
