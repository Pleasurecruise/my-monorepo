// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
	// Load all env vars (no prefix filter) so SSR modules can access process.env
	Object.assign(process.env, loadEnv(mode, "../../", ""));

	return {
		server: {
			port: 3000,
		},
		envDir: "../../",
		envPrefix: ["PUBLIC_"],
		plugins: [
			tsConfigPaths(),
			tanstackStart(),
			// react's vite plugin must come after start's vite plugin
			viteReact(),
			tailwindcss(),
		],
	};
});
