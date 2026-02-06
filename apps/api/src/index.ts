import "@/load-env";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { createLoggerWithContext } from "@my-monorepo/logger";
import { appRouter } from "@/trpc/routers";
import { createTRPCContext } from "@/trpc/init";

const logger = createLoggerWithContext("api");

const app = new Hono();

app.use(
	"*",
	cors({
		origin: [
			"http://localhost:3000", // web
			"http://localhost:1420", // tauri
		],
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "trpc-accept", "trpc-batch-mode", "x-trpc-source"],
	}),
);

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

logger.info(`Server running on http://localhost:${port}`);

export default {
	port,
	fetch: app.fetch,
};
