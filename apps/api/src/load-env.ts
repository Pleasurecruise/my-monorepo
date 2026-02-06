import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
