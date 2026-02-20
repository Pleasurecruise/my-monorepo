import { z } from "@my-monorepo/utils";

export const schema = z.object({
	// Logging
	LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
	LOG_PRETTY: z.enum(["true", "false"]).default("false"),
	// Server
	PORT: z.coerce.number().default(5173),
	// Database
	DATABASE_URL: z.string().url(),
	// Better Auth
	BETTER_AUTH_URL: z.string().url(),
	BETTER_AUTH_SECRET: z.string().min(1),
	TAURI_URL: z.string().url().optional(),
	// OAuth (optional)
	GITHUB_CLIENT_ID: z.string().optional(),
	GITHUB_CLIENT_SECRET: z.string().optional(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	// AI (optional)
	OPENAI_API_KEY: z.string().optional(),
	OPENAI_API_URL: z.string().url().optional(),
	OPENAI_MODEL: z.string().optional(),
	// Redis (optional)
	REDIS_URL: z.string().url().optional(),
	// Email (optional)
	MAIL_HOST: z.string().optional(),
	MAIL_PORT: z.coerce.number().default(587),
	MAIL_SECURE: z.enum(["true", "false"]).default("false"),
	MAIL_AUTH_USER: z.string().optional(),
	MAIL_AUTH_PASS: z.string().optional(),
	MAIL_FROM: z.string().optional(),
	// Crypto (optional)
	ENCRYPTION_KEY: z.string().length(64).optional(),
	FILE_KEY_SECRET: z.string().optional(),
	// Client-side (Vite)
	VITE_API_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof schema>;
