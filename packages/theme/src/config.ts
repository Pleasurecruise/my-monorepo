import type { Theme } from "./types";

const STORAGE_KEY = "theme";
const MEDIA = "(prefers-color-scheme: dark)";

export function getSystemTheme(): "light" | "dark" {
	return window.matchMedia(MEDIA).matches ? "dark" : "light";
}

export function getTheme(): Theme {
	return (localStorage.getItem(STORAGE_KEY) as Theme) || "system";
}

export function setTheme(theme: Theme): void {
	localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme: Theme): void {
	const resolved = theme === "system" ? getSystemTheme() : theme;
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(resolved);
	root.style.colorScheme = resolved;

	// Tauri v2: set window theme
	if ("__TAURI__" in window) {
		import("@tauri-apps/api/window")
			.then(({ getCurrentWindow }) => {
				const tauriTheme = theme === "system" ? null : resolved;
				getCurrentWindow().setTheme(tauriTheme as "light" | "dark" | null);
			})
			.catch(() => {});
	}
}

export function onSystemThemeChange(callback: () => void): () => void {
	const mq = window.matchMedia(MEDIA);
	mq.addEventListener("change", callback);
	return () => mq.removeEventListener("change", callback);
}

export function onStorageChange(callback: (theme: Theme) => void): () => void {
	const handler = (e: StorageEvent) => {
		if (e.key === STORAGE_KEY && e.newValue) {
			callback(e.newValue as Theme);
		}
	};
	window.addEventListener("storage", handler);
	return () => window.removeEventListener("storage", handler);
}
