import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "mobile_auth_token";

export async function getToken(): Promise<string | null> {
	return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(value: string): Promise<void> {
	return SecureStore.setItemAsync(TOKEN_KEY, value);
}

export async function deleteToken(): Promise<void> {
	return SecureStore.deleteItemAsync(TOKEN_KEY);
}
