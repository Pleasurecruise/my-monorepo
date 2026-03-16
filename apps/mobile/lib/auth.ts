import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { getBaseUrl } from "./base-url";

export const authClient = createAuthClient({
	baseURL: `${getBaseUrl()}/api/auth`,
	plugins: [
		expoClient({
			scheme: "mobile",
			storagePrefix: "mobile",
			storage: SecureStore,
		}),
	],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
