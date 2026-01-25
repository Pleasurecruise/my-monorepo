import { useState } from "react";

export type Theme = "light" | "dark" | "system";

interface UseThemeReturn {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

export function useTheme(): UseThemeReturn {
	const [theme, setTheme] = useState<Theme>("system");

	return { theme, setTheme };
}
