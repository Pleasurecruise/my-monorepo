import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@my-monorepo/ui/components/button";
import { trpc } from "./lib/trpc";
import { setLanguage } from "./lib/i18n";
import { useTranslation, getCurrentLanguage } from "@my-monorepo/i18n";

function App() {
	const [count, setCount] = useState(0);
	const { t } = useTranslation();
	const { data: helloData, isLoading } = useQuery(
		trpc.hello.greet.queryOptions(),
	);

	const toggleLanguage = () => {
		const current = getCurrentLanguage();
		setLanguage(current === "en" ? "zh" : "en");
	};

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4">
			<div className="p-4 border rounded">
				<h2 className="text-lg font-bold mb-2">i18n Test</h2>
				<p>{t("common.welcome")}</p>
				<Button type="button" onClick={toggleLanguage} className="mt-2">
					{t("settings.language")}: {getCurrentLanguage().toUpperCase()}
				</Button>
			</div>

			<div className="p-4 border rounded">
				<h2 className="text-lg font-bold mb-2">tRPC Test</h2>
				{isLoading ? <p>{t("common.loading")}</p> : <p>{helloData?.message}</p>}
			</div>

			<Button type="button" onClick={() => setCount((c) => c + 1)}>
				Add 1 to {count}?
			</Button>
		</main>
	);
}

export default App;
