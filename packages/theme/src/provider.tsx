import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Theme } from "./types";
import {
	getTheme,
	setTheme as saveTheme,
	applyTheme,
	onSystemThemeChange,
	onStorageChange,
} from "./config";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("system");

	const handleSetTheme = (newTheme: Theme) => {
		saveTheme(newTheme);
		setThemeState(newTheme);
		applyTheme(newTheme);
	};

	// Load and apply on client mount
	useEffect(() => {
		const storedTheme = getTheme();
		setThemeState(storedTheme);
		applyTheme(storedTheme);
	}, []);

	// Listen system theme changes
	useEffect(() => {
		return onSystemThemeChange(() => {
			if (theme === "system") {
				applyTheme("system");
			}
		});
	}, [theme]);

	// Sync across tabs
	useEffect(() => {
		return onStorageChange((newTheme) => {
			setThemeState(newTheme);
			applyTheme(newTheme);
		});
	}, []);

	const value: ThemeContextValue = { theme, setTheme: handleSetTheme };

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return context;
}
