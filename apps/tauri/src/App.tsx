import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { Button } from "@my-monorepo/ui/components/button";
import { trpc } from "@/lib/trpc";
import { setLanguage } from "@/lib/i18n";
import { getTheme, setTheme, type AppTheme } from "@/lib/theme";
import { useTranslation, getCurrentLanguage } from "@my-monorepo/i18n";
import type { AppRouter } from "@my-monorepo/api/routers";
import { superjson } from "@my-monorepo/utils";

const chatClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchStreamLink({
			url: "http://localhost:5173/trpc",
			transformer: superjson,
		}),
	],
});

function App() {
	const { t } = useTranslation();
	const [theme, setThemeState] = useState<AppTheme>(getTheme);
	const { data: helloData, isLoading, isError } = useQuery(trpc.hello.greet.queryOptions());

	const toggleLanguage = () => {
		const current = getCurrentLanguage();
		setLanguage(current === "en" ? "zh" : "en");
	};

	const toggleTheme = () => {
		const themes = ["light", "dark", "auto"] as const;
		const next = themes[(themes.indexOf(theme) + 1) % themes.length]!;
		setTheme(next);
		setThemeState(next);
	};

	const [prompt, setPrompt] = useState("");
	const [assistantText, setAssistantText] = useState("");
	const [streamStatus, setStreamStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSendMessage = async () => {
		const content = prompt.trim();
		if (!content || streamStatus === "streaming") return;

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
		<main className="flex min-h-screen flex-col items-center p-4">
			<div className="flex w-full max-w-2xl flex-col gap-4">
				<div className="p-4 border rounded bg-card text-card-foreground">
					<h2 className="text-lg font-bold mb-2">i18n Test</h2>
					<p>{t("common.welcome")}</p>
					<Button type="button" onClick={toggleLanguage} className="mt-2">
						{t("settings.language")}: {getCurrentLanguage().toUpperCase()}
					</Button>
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
		</main>
	);
}

export default App;
