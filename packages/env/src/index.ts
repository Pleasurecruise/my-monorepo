import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "@my-monorepo/utils";

// Load .env from monorepo root before validation
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const envPath = resolve(rootDir, ".env");

if (existsSync(envPath)) {
	const contents = readFileSync(envPath, "utf8");

	for (const line of contents.split(/\r?\n/u)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}

		const [rawKey, ...rest] = trimmed.split("=");
		const key = rawKey?.trim();
		if (!key || process.env[key] !== undefined) {
			continue;
		}

		const rawValue = rest.join("=");
		process.env[key] = rawValue.replace(/^(['"])(.*)\1$/u, "$2").replace(/\\n/g, "\n");
	}
}

const schema = z.object({
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

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;