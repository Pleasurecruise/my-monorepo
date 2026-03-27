import { View, Text, Pressable, useColorScheme } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { setLanguage, useTranslation, getCurrentLanguage } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useSession, signOut } from "@/lib/auth";

export default function Home() {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();
	const systemColorScheme = useColorScheme();
	const router = useRouter();
	const { data: session } = useSession();
	const { data: helloData, isLoading, isError } = useQuery(trpc.hello.greet.queryOptions());

	const isDark = theme === "system" ? systemColorScheme === "dark" : theme === "dark";

	const toggleLanguage = () => {
		const current = getCurrentLanguage();
		void setLanguage(current === "en" ? "zh" : "en");
	};

	return (
		<View
			className={`flex-1 justify-center items-center gap-5 p-4 ${isDark ? "bg-neutral-900" : "bg-white"}`}
		>
			{/* i18n */}
			<View
				className={`w-full p-4 rounded-xl border ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"}`}
			>
				<Text className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}>
					i18n Test
				</Text>
				<Text className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
					{t("common.welcome")}
				</Text>
				<Pressable
					className="bg-blue-500 active:opacity-70 px-6 py-3 rounded-lg"
					onPress={toggleLanguage}
				>
					<Text className="text-white text-base font-semibold text-center">
						{t("settings.language")}: {getCurrentLanguage().toUpperCase()}
					</Text>
				</Pressable>
			</View>

			{/* Theme */}
			<View
				className={`w-full p-4 rounded-xl border ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"}`}
			>
				<Text className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}>
					Theme Test
				</Text>
				<View className="flex-row gap-2">
					{(["light", "dark", "system"] as const).map((t) => (
						<Pressable
							key={t}
							className={`flex-1 py-2 rounded-lg border active:opacity-70 ${
								theme === t
									? "bg-blue-500 border-blue-500"
									: isDark
										? "bg-neutral-700 border-neutral-600"
										: "bg-white border-neutral-300"
							}`}
							onPress={() => setTheme(t)}
						>
							<Text
								className={`text-sm font-semibold text-center capitalize ${
									theme === t ? "text-white" : isDark ? "text-white" : "text-neutral-700"
								}`}
							>
								{t}
							</Text>
						</Pressable>
					))}
				</View>
			</View>

			{/* tRPC */}
			<View
				className={`w-full p-4 rounded-xl border ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"}`}
			>
				<Text className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}>
					tRPC Test
				</Text>
				{isLoading ? (
					<Text className={`text-base ${isDark ? "text-white" : "text-black"}`}>
						{t("common.loading")}
					</Text>
				) : isError ? (
					<Text className="text-base text-red-500">{t("common.error")} - API not running?</Text>
				) : (
					<Text className={`text-base ${isDark ? "text-white" : "text-black"}`}>
						{helloData?.message}
					</Text>
				)}
			</View>

			{/* Auth */}
			<View
				className={`w-full p-4 rounded-xl border ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"}`}
			>
				<Text className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}>
					Auth
				</Text>
				{session?.user ? (
					<View className="gap-2">
						<Text className={`text-sm ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
							{t("auth.loggedInAs")}: {session.user.email}
						</Text>
						<Pressable
							className="bg-red-500 active:opacity-70 px-4 py-2 rounded-lg mt-1"
							onPress={() => signOut()}
						>
							<Text className="text-white text-sm font-semibold text-center">
								{t("auth.logout")}
							</Text>
						</Pressable>
					</View>
				) : (
					<Pressable
						className="bg-blue-500 active:opacity-70 px-4 py-3 rounded-lg"
						onPress={() => router.push("/login")}
					>
						<Text className="text-white text-base font-semibold text-center">
							{t("auth.login")}
						</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
}
