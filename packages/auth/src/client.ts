import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Auth } from "./server.js";

/**
 * Create a configured better-auth client.
 * Use this when you need a custom baseURL (e.g. cross-origin API server).
 *
 * @example
 * // apps/tauri/src/App.tsx
 * import { createBetterAuthClient } from "@my-monorepo/auth/client";
 * const authClient = createBetterAuthClient("http://localhost:3000");
 */
export function createBetterAuthClient(baseURL?: string) {
	return createAuthClient({
		baseURL,
		plugins: [inferAdditionalFields<Auth>()],
	});
}

/**
 * Pre-configured auth client.
 * Works when the client and API server share the same origin,
 * or when BETTER_AUTH_URL is set in the environment.
 */
export const authClient = createBetterAuthClient();

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
