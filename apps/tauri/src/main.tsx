import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@my-monorepo/theme";
import { queryClient } from "@/lib/trpc";
import "@my-monorepo/ui/styles/globals.css";
import { initI18n } from "@/lib/i18n";
import App from "@/App";

initI18n();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<App />
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
