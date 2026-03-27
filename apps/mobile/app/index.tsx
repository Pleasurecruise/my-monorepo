import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { setLanguage, useTranslation, getCurrentLanguage } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useSession, signOut } from "@/lib/auth";
import { Button } from "@my-monorepo/ui-native/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@my-monorepo/ui-native/components/ui/card";
import { Text } from "@my-monorepo/ui-native/components/ui/text";

export default function Home() {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();
	const router = useRouter();
	const { data: session } = useSession();
	const { data: helloData, isLoading, isError } = useQuery(trpc.hello.greet.queryOptions());

	const toggleLanguage = () => {
		const current = getCurrentLanguage();
		void setLanguage(current === "en" ? "zh" : "en");
	};

	return (
		<View className="flex-1 justify-center items-center gap-5 p-4 bg-background">
			{/* i18n */}
			<Card className="w-full">
				<CardHeader>
					<CardTitle>i18n Test</CardTitle>
				</CardHeader>
				<CardContent className="gap-3">
					<Text>{t("common.welcome")}</Text>
					<Button onPress={toggleLanguage}>
						<Text>
							{t("settings.language")}: {getCurrentLanguage().toUpperCase()}
						</Text>
					</Button>
				</CardContent>
			</Card>

			{/* Theme */}
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Theme Test</CardTitle>
				</CardHeader>
				<CardContent>
					<View className="flex-row gap-2">
						{(["light", "dark", "system"] as const).map((option) => (
							<Button
								key={option}
								variant={theme === option ? "default" : "outline"}
								className="flex-1"
								onPress={() => setTheme(option)}
							>
								<Text className="capitalize">{option}</Text>
							</Button>
						))}
					</View>
				</CardContent>
			</Card>

			{/* tRPC */}
			<Card className="w-full">
				<CardHeader>
					<CardTitle>tRPC Test</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Text variant="muted">{t("common.loading")}</Text>
					) : isError ? (
						<Text className="text-destructive">{t("common.error")} - API not running?</Text>
					) : (
						<Text>{helloData?.message}</Text>
					)}
				</CardContent>
			</Card>

			{/* Auth */}
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Auth</CardTitle>
				</CardHeader>
				<CardContent className="gap-3">
					{session?.user ? (
						<>
							<Text variant="muted">
								{t("auth.loggedInAs")}: {session.user.email}
							</Text>
							<Button variant="destructive" onPress={() => signOut()}>
								<Text>{t("auth.logout")}</Text>
							</Button>
						</>
					) : (
						<Button onPress={() => router.push("/login")}>
							<Text>{t("auth.login")}</Text>
						</Button>
					)}
				</CardContent>
			</Card>
		</View>
	);
}
