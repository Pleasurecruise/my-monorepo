import { useState } from "react";
import { View, Text, TextInput, Pressable, useColorScheme, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { signIn } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

export default function Login() {
	const router = useRouter();
	const systemColorScheme = useColorScheme();
	const isDark = systemColorScheme === "dark";
	const { t } = useTranslation();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleLogin = async () => {
		if (!email || !password) {
			setError(t("auth.fillRequired"));
			return;
		}

		setLoading(true);
		setError(null);

		const { error: signInError } = await signIn.email({ email, password });

		setLoading(false);

		if (signInError) {
			setError(signInError.message ?? t("auth.loginFailed"));
			return;
		}

		router.replace("/");
	};

	return (
		<View className={`flex-1 justify-center px-6 ${isDark ? "bg-neutral-900" : "bg-white"}`}>
			<Text className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}>
				{t("auth.login")}
			</Text>
			<Text className={`text-base mb-8 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
				{t("auth.loginSubtitle")}
			</Text>

			<View className="gap-4">
				<View>
					<Text
						className={`text-sm font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}
					>
						{t("auth.email")}
					</Text>
					<TextInput
						className={`border rounded-xl px-4 py-3 text-base ${
							isDark
								? "border-neutral-700 bg-neutral-800 text-white"
								: "border-neutral-200 bg-neutral-50 text-black"
						}`}
						placeholder={t("auth.emailPlaceholder")}
						placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						keyboardType="email-address"
						autoComplete="email"
					/>
				</View>

				<View>
					<Text
						className={`text-sm font-medium mb-1.5 ${isDark ? "text-neutral-300" : "text-neutral-700"}`}
					>
						{t("auth.password")}
					</Text>
					<TextInput
						className={`border rounded-xl px-4 py-3 text-base ${
							isDark
								? "border-neutral-700 bg-neutral-800 text-white"
								: "border-neutral-200 bg-neutral-50 text-black"
						}`}
						placeholder={t("auth.passwordPlaceholder")}
						placeholderTextColor={isDark ? "#737373" : "#a3a3a3"}
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						autoComplete="password"
					/>
				</View>

				{error && <Text className="text-red-500 text-sm">{error}</Text>}

				<Pressable
					className={`rounded-xl py-3.5 mt-2 active:opacity-80 ${loading ? "bg-blue-400" : "bg-blue-500"}`}
					onPress={handleLogin}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="white" />
					) : (
						<Text className="text-white text-base font-semibold text-center">
							{t("auth.login")}
						</Text>
					)}
				</Pressable>

				<Pressable className="py-2 active:opacity-70" onPress={() => router.back()}>
					<Text
						className={`text-sm text-center ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
					>
						{t("common.back")}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}
