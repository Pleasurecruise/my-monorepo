import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmail } from "@my-monorepo/utils/email";
import prisma from "@my-monorepo/db";

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	trustedOrigins: [process.env.BETTER_AUTH_URL, process.env.TAURI_URL].filter(Boolean) as string[],

	/** if no database is provided, the user data will be stored in memory.
	 * Make sure to provide a database to persist user data **/
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Reset your password",
				html: `<p>Click the link below to reset your password:</p><p><a href="${url}">${url}</a></p>`,
			});
		},
	},
	// emailVerification: {
	//     sendVerificationEmail: async ( { user, url, token }, request) => {
	//         await sendEmail({
	//             to: user.email,
	//             subject: "Verify your email address",
	//             html: `<a href="${url}">Click the link to verify your email</a>`
	//         });
	//     },
	// },
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
	session: {
		fields: {
			expiresAt: "expiresAt",
			token: "token",
		},
		cookieCache: {
			enabled: true,
			maxAge: 30 * 60, // Cache duration in seconds
		},
	},
});

/**
 * Get the current session from request headers.
 * Use this in server-side handlers (e.g. Hono middleware).
 *
 * For TanStack Start, use createServerFn + getRequestHeaders() instead.
 *
 * @example
 * // In a Hono route handler
 * const session = await getSession(c.req.raw.headers);
 */
export const getSession = async (headers: Headers) => {
	return await auth.api.getSession({ headers });
};

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
