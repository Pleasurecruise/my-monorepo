// src/routes/{-$locale}/index.tsx
import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
	useRouteContext,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { useState } from "react";
import { Button } from "@my-monorepo/ui/components/button";
import type { AppRouter } from "@my-monorepo/api/routers";
import { superjson } from "@my-monorepo/utils";
import { trpc } from "@/lib/trpc";
import {
	useTranslation,
	changeLanguage,
	supportedLanguages,
	type SupportedLanguage,
} from "@my-monorepo/i18n";
import { setThemeServerFn } from "@/lib/theme";

function isValidLocale(locale: string | undefined): locale is SupportedLanguage {
	return supportedLanguages.includes(locale as SupportedLanguage);
}

export const Route = createFileRoute("/{-$locale}/")({
	component: Home,
	beforeLoad: ({ params }) => {
		const locale = params.locale || "en";

		if (params.locale && !isValidLocale(params.locale)) {
			throw redirect({ to: "/{-$locale}", params: { locale: undefined } });
		}

		void changeLanguage(locale as SupportedLanguage);

		return { locale: locale as SupportedLanguage };
	},
});

const chatClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchStreamLink({
			url: "http://localhost:5173/trpc",
			transformer: superjson,
		}),
	],
});

function Home() {
	const { locale } = Route.useRouteContext();
	const { theme } = useRouteContext({ from: "__root__" });
	const router = useRouter();
	const { t } = useTranslation();

	const { data: helloData, isLoading, isError } = useQuery(trpc.hello.greet.queryOptions());
	const [prompt, setPrompt] = useState("");
	const [assistantText, setAssistantText] = useState("");
	const [streamStatus, setStreamStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const toggleTheme = () => {
		const themes = ["light", "dark", "auto"] as const;
		const next = themes[(themes.indexOf(theme) + 1) % themes.length]!;
		setThemeServerFn({ data: next }).then(() => router.invalidate());
	};

	const handleSendMessage = async () => {
		const content = prompt.trim();
		if (!content || streamStatus === "streaming") {
			return;
		}

		setAssistantText("");
		setErrorMessage(null);
		setStreamStatus("streaming");

		try {
			let runningText = "";
			const stream = await chatClient.chat.sendMessage.mutate({
				messages: [{ role: "user", content }],
			});

			for await (const chunk of stream) {
				if (chunk.text) {
					runningText += chunk.text;
					setAssistantText(runningText);
				}

				if (chunk.status === "done") {
					setStreamStatus("done");
				}

				if (chunk.status === "error") {
					setStreamStatus("error");
				}
			}
		} catch (error) {
			setStreamStatus("error");
			setErrorMessage(error instanceof Error ? error.message : "Unknown error");
		}
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="p-4 border rounded bg-card text-card-foreground">
				<h2 className="text-lg font-bold mb-2">i18n Test</h2>
				<p>{t("common.welcome")}</p>
				<div className="flex gap-2 mt-2">
					<Link
						to="/{-$locale}"
						params={{ locale: undefined }}
						className="px-3 py-1 border rounded"
						activeProps={{ className: "bg-blue-500 text-white" }}
					>
						EN
					</Link>
					<Link
						to="/{-$locale}"
						params={{ locale: "zh" }}
						className="px-3 py-1 border rounded"
						activeProps={{ className: "bg-blue-500 text-white" }}
					>
						中文
					</Link>
				</div>
				<p className="mt-2 text-sm text-gray-500">
					{t("settings.language")}: {locale.toUpperCase()}
				</p>
			</div>

			<div className="p-4 border rounded bg-card text-card-foreground">
				<h2 className="text-lg font-bold mb-2">Theme Test</h2>
				<Button type="button" onClick={toggleTheme}>
					{theme}
				</Button>
			</div>

			<div className="p-4 border rounded bg-card text-card-foreground">
				<h2 className="text-lg font-bold mb-2">tRPC Test</h2>
				{isLoading ? (
					<p>{t("common.loading")}</p>
				) : isError ? (
					<p className="text-red-500">{t("common.error")} - API not running?</p>
				) : (
					<p>{helloData?.message}</p>
				)}
			</div>

			<div className="p-4 border rounded bg-card text-card-foreground">
				<h2 className="text-lg font-bold mb-2">Chat Test</h2>
				<div className="flex flex-col gap-3">
					<textarea
						className="min-h-24 rounded border bg-background p-2 text-sm"
						placeholder="Type a message..."
						value={prompt}
						onChange={(event) => setPrompt(event.target.value)}
					/>
					<div className="flex flex-wrap items-center gap-2">
						<Button type="button" onClick={handleSendMessage} disabled={!prompt.trim()}>
							Send
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setPrompt("");
								setAssistantText("");
								setErrorMessage(null);
								setStreamStatus("idle");
							}}
						>
							Clear
						</Button>
						<span className="text-sm text-muted-foreground">Status: {streamStatus}</span>
					</div>
					{errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
					<div className="min-h-30 whitespace-pre-wrap rounded border bg-muted p-3 text-sm">
						{assistantText || "Waiting for response..."}
					</div>
				</div>
			</div>
		</div>
	);
}
