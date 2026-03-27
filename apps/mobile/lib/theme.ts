import { useColorScheme } from "nativewind";

export type Theme = "light" | "dark" | "system";

export { THEME, NAV_THEME } from "@my-monorepo/ui-native/lib/theme";

export function useTheme() {
	const colorSchemeResult = useColorScheme();

	return {
		theme: colorSchemeResult.colorScheme as Theme,
		setTheme: (theme: Parameters<typeof colorSchemeResult.setColorScheme>[0]) =>
			colorSchemeResult.setColorScheme(theme),
	};
}
