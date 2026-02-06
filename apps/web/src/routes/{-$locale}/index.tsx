// src/routes/{-$locale}/index.tsx
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { useEffect, useState } from "react";
import { Button } from "@my-monorepo/ui/components/button";
import type { AppRouter } from "@my-monorepo/api/routers";
import { trpc } from "@/lib/trpc";
import superjson from "superjson";
import {
	useTranslation,
	changeLanguage,
	supportedLanguages,
	type SupportedLanguage,
} from "@my-monorepo/i18n";
import { useTheme } from "@my-monorepo/theme";

function isValidLocale(locale: string | undefined): locale is SupportedLanguage {
	return supportedLanguages.includes(locale as SupportedLanguage);
}

type ResumeState = {
	streamId: string;
	resumeAt: number;
	assistantText: string;
	status: "streaming" | "done" | "error";
};

const RESUME_STORAGE_KEY = "chat-resume";

const loadResumeState = (): ResumeState | null => {
	if (typeof window === "undefined") {
		return null;
	}

	const saved = sessionStorage.getItem(RESUME_STORAGE_KEY);
	if (!saved) {
		return null;
	}

	try {
		return JSON.parse(saved) as ResumeState;
	} catch {
		return null;
	}
};

const saveResumeState = (state: ResumeState | null) => {
	if (typeof window === "undefined") {
		return;
	}

	if (!state) {
		sessionStorage.removeItem(RESUME_STORAGE_KEY);
		return;
	}

	sessionStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(state));
};

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
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();

	const { data: helloData, isLoading, isError } = useQuery(trpc.hello.greet.queryOptions());
	const [prompt, setPrompt] = useState("");
	const [assistantText, setAssistantText] = useState("");
	const [streamStatus, setStreamStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [streamId, setStreamId] = useState<string | null>(null);
	const [resumeState, setResumeState] = useState<ResumeState | null>(null);

	useEffect(() => {
		const saved = loadResumeState();
		if (!saved) {
			return;
		}

		setResumeState(saved);
		setAssistantText(saved.assistantText);
		setStreamId(saved.streamId);
	}, []);

	const updateResumeState = (nextState: ResumeState | null) => {
		setResumeState(nextState);
		saveResumeState(nextState);
	};

	const handleSendMessage = async () => {
		const content = prompt.trim();
		if (!content || streamStatus === "streaming") {
			return;
		}

		setAssistantText("");
		setErrorMessage(null);
		setStreamId(null);
		updateResumeState(null);
		setStreamStatus("streaming");

		try {
			let runningText = "";
			const stream = await chatClient.chat.sendMessage.mutate({
				messages: [{ role: "user", content }],
			});

			for await (const chunk of stream) {
				setStreamId(chunk.streamId);

				if (chunk.text) {
					runningText += chunk.text;
					setAssistantText(runningText);
				}

				if (chunk.resumable && typeof chunk.resumeAt === "number") {
					updateResumeState({
						streamId: chunk.streamId,
						resumeAt: chunk.resumeAt,
						assistantText: runningText,
						status: chunk.status,
					});
				}

				if (chunk.status === "done") {
					setStreamStatus("done");
					updateResumeState(null);
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

	const handleResumeStream = async () => {
		if (!resumeState || streamStatus === "streaming") {
			return;
		}

		setErrorMessage(null);
		setStreamStatus("streaming");
		setStreamId(resumeState.streamId);

		try {
			let runningText = resumeState.assistantText || "";
			setAssistantText(runningText);

			const stream = await chatClient.chat.sendMessage.mutate({
				streamId: resumeState.streamId,
				resumeAt: resumeState.resumeAt,
			});

			for await (const chunk of stream) {
				setStreamId(chunk.streamId);

				if (chunk.text) {
					runningText += chunk.text;
					setAssistantText(runningText);
				}

				if (chunk.resumable && typeof chunk.resumeAt === "number") {
					updateResumeState({
						streamId: chunk.streamId,
						resumeAt: chunk.resumeAt,
						assistantText: runningText,
						status: chunk.status,
					});
				}

				if (chunk.status === "done") {
					setStreamStatus("done");
					updateResumeState(null);
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
				<div className="flex gap-2">
					<Button
						type="button"
						variant={theme === "light" ? "default" : "outline"}
						onClick={() => setTheme("light")}
					>
						Light
					</Button>
					<Button
						type="button"
						variant={theme === "dark" ? "default" : "outline"}
						onClick={() => setTheme("dark")}
					>
						Dark
					</Button>
					<Button
						type="button"
						variant={theme === "system" ? "default" : "outline"}
						onClick={() => setTheme("system")}
					>
						System
					</Button>
				</div>
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
							onClick={handleResumeStream}
							disabled={!resumeState || streamStatus === "streaming"}
						>
							Resume
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setPrompt("");
								setAssistantText("");
								setErrorMessage(null);
								setStreamId(null);
								updateResumeState(null);
								setStreamStatus("idle");
							}}
						>
							Clear
						</Button>
						<span className="text-sm text-muted-foreground">Status: {streamStatus}</span>
						{streamId ? (
							<span className="text-sm text-muted-foreground">Stream ID: {streamId}</span>
						) : null}
						{resumeState ? (
							<span className="text-sm text-muted-foreground">
								Resume At: {resumeState.resumeAt}
							</span>
						) : null}
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
