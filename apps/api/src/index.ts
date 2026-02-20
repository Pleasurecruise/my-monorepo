import "@my-monorepo/env";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { createLoggerWithContext } from "@my-monorepo/logger";
import { appRouter } from "@/trpc/routers";
import { createTRPCContext } from "@/trpc/init";
import { auth } from "@my-monorepo/auth/server";
import { env } from "@my-monorepo/env";

const logger = createLoggerWithContext("api");

const app = new Hono();

const allowedOrigins = [env.BETTER_AUTH_URL, env.TAURI_URL].filter(Boolean) as string[];

app.use(
	"*",
	cors({
		origin: allowedOrigins,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: [
			"Content-Type",
			"Authorization",
			"trpc-accept",
			"trpc-batch-mode",
			"x-trpc-source",
		],
		credentials: true,
	}),
);

app.on(["GET", "POST"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: createTRPCContext,
	}),
);

app.get("/", (c) => {
	return c.json({ message: "tRPC API Server" });
});

const port = Number(process.env.PORT) || 5173;

serve({ fetch: app.fetch, port }, () => {
	logger.info(`Server running on http://localhost:${port}`);
});
