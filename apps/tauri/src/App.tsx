import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@my-monorepo/theme";
import { Button } from "@my-monorepo/ui/components/button";
import { trpc } from "@/lib/trpc";
import { setLanguage } from "@/lib/i18n";
import { useTranslation, getCurrentLanguage } from "@my-monorepo/i18n";

function App() {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();
	const { data: helloData, isLoading } = useQuery(trpc.hello.greet.queryOptions());

	const toggleLanguage = () => {
		const current = getCurrentLanguage();
		setLanguage(current === "en" ? "zh" : "en");
	};

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4">
			<div className="p-4 border rounded bg-card text-card-foreground">
				<h2 className="text-lg font-bold mb-2">i18n Test</h2>
				<p>{t("common.welcome")}</p>
				<Button type="button" onClick={toggleLanguage} className="mt-2">
					{t("settings.language")}: {getCurrentLanguage().toUpperCase()}
				</Button>
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
				{isLoading ? <p>{t("common.loading")}</p> : <p>{helloData?.message}</p>}
			</div>
		</main>
	);
}

export default App;
