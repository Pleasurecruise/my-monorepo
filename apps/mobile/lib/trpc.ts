import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@my-monorepo/api/routers";
import { superjson } from "@my-monorepo/utils";
import { createQueryClient } from "./query-client";
import { getBaseUrl } from "./base-url";
import { authClient } from "./auth";

export const queryClient = createQueryClient();

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		loggerLink({
			enabled: (op) =>
				process.env.NODE_ENV === "development" ||
				(op.direction === "down" && op.result instanceof Error),
		}),
		httpBatchLink({
			url: `${getBaseUrl()}/trpc`,
			transformer: superjson,
			async headers() {
				const headers = new Map<string, string>();
				headers.set("x-trpc-source", "expo-react");

				const cookie = await authClient.getCookie();
				if (cookie) headers.set("Cookie", cookie);

				return Object.fromEntries(headers);
			},
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
