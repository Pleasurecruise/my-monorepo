// src/routes/{-$locale}/index.tsx
import * as fs from "node:fs";
import {
	createFileRoute,
	useRouter,
	Link,
	redirect,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@my-monorepo/ui/components/button";
import { trpc } from "@/src/lib/trpc";
import {
	useTranslation,
	changeLanguage,
	supportedLanguages,
	type SupportedLanguage,
} from "@my-monorepo/i18n";

const filePath = "count.txt";

async function readCount() {
	return parseInt(
		await fs.promises.readFile(filePath, "utf-8").catch(() => "0"),
		10,
	);
}

const getCount = createServerFn({
	method: "GET",
}).handler(() => {
	return readCount();
});

const updateCount = createServerFn({ method: "POST" })
	.inputValidator((d: number) => d)
	.handler(async ({ data }) => {
		const count = await readCount();
		await fs.promises.writeFile(filePath, `${count + data}`);
	});

function isValidLocale(
	locale: string | undefined,
): locale is SupportedLanguage {
	return supportedLanguages.includes(locale as SupportedLanguage);
}

export const Route = createFileRoute("/{-$locale}/")({
	component: Home,
	loader: async () => await getCount(),
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
	const router = useRouter();
	const state = Route.useLoaderData();
	const { locale } = Route.useRouteContext();
	const { t } = useTranslation();

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

			<Button
				type="button"
				onClick={() => {
					updateCount({ data: 1 }).then(() => {
						router.invalidate();
					});
				}}
			>
				Add 1 to {state}?
			</Button>
		</div>
	);
}
