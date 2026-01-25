// src/routes/{-$locale}/index.tsx
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@my-monorepo/ui/components/button";
import { trpc } from "@/src/lib/trpc";
import {
	useTranslation,
	changeLanguage,
	supportedLanguages,
	type SupportedLanguage,
} from "@my-monorepo/i18n";
import { useTheme } from "@my-monorepo/theme";

function isValidLocale(
	locale: string | undefined,
): locale is SupportedLanguage {
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

function Home() {
	const { locale } = Route.useRouteContext();
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();

	const {
		data: helloData,
		isLoading,
		isError,
	} = useQuery(trpc.hello.greet.queryOptions());

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="p-4 border rounded">
				<h2 className="text-lg font-bold mb-2">i18n Test</h2>
				<p>{t("common.welcome")}</p>
				<div className="flex gap-2 mt-2">
					<Link
						to="/{-$locale}"
						params={{ locale: undefined }}
						className="px-3 py-1 border rounded hover:bg-gray-100"
						activeProps={{ className: "bg-blue-500 text-white" }}
					>
						EN
					</Link>
					<Link
						to="/{-$locale}"
						params={{ locale: "zh" }}
						className="px-3 py-1 border rounded hover:bg-gray-100"
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

			<div className="p-4 border rounded">
				<h2 className="text-lg font-bold mb-2">tRPC Test</h2>
				{isLoading ? (
					<p>{t("common.loading")}</p>
				) : isError ? (
					<p className="text-red-500">{t("common.error")} - API not running?</p>
				) : (
					<p>{helloData?.message}</p>
				)}
			</div>
		</div>
	);
}
