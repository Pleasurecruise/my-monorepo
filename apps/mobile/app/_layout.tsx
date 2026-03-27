import "../global.css";

import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { queryClient } from "@/lib/trpc";
import { initI18n } from "@/lib/i18n";
import { NAV_THEME } from "@/lib/theme";

initI18n();

export default function RootLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<SafeAreaProvider>
			<ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
				<QueryClientProvider client={queryClient}>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="index" />
						<Stack.Screen name="login" />
					</Stack>
				</QueryClientProvider>
			</ThemeProvider>
		</SafeAreaProvider>
	);
}
