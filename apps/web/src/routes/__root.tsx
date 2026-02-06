// src/routes/__root.tsx
/// <reference types="vite/client" />
import type { ReactNode } from "react";
import {
	Outlet,
	createRootRouteWithContext,
	HeadContent,
	Scripts,
	Navigate,
} from "@tanstack/react-router";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "@my-monorepo/theme";
import appCss from "@my-monorepo/ui/styles/globals.css?url";
import { getCurrentLanguage } from "@my-monorepo/i18n";

export interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "my-monorepo",
			},
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
	notFoundComponent: () => <Navigate to="/{-$locale}" params={{ locale: "en" }} />,
});

function RootComponent() {
	const { queryClient } = Route.useRouteContext();
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<RootDocument>
					<Outlet />
				</RootDocument>
			</ThemeProvider>
		</QueryClientProvider>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	const lang = getCurrentLanguage();
	return (
		<html lang={lang}>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
