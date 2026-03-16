import "../global.css";

import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "@/lib/trpc";
import { initI18n } from "@/lib/i18n";

initI18n();

export default function RootLayout() {
	return (
		<SafeAreaProvider>
			<QueryClientProvider client={queryClient}>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="index" />
					<Stack.Screen name="login" />
				</Stack>
			</QueryClientProvider>
		</SafeAreaProvider>
	);
}
