import { View, Text, Pressable, StyleSheet, useColorScheme } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { setLanguage, useTranslation, getCurrentLanguage } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export default function Home() {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();
	const systemColorScheme = useColorScheme();
	const { data: helloData, isLoading, isError } = useQuery(trpc.hello.greet.queryOptions());

	const isDark = theme === "system" ? systemColorScheme === "dark" : theme === "dark";

	const toggleLanguage = () => {
		const current = getCurrentLanguage();
		setLanguage(current === "en" ? "zh" : "en");
	};

	return (
		<View style={[styles.container, isDark && styles.containerDark]}>
			<View style={[styles.card, isDark && styles.cardDark]}>
				<Text style={[styles.cardTitle, isDark && styles.textDark]}>i18n Test</Text>
				<Text style={[styles.cardText, isDark && styles.textDark]}>{t("common.welcome")}</Text>
				<Pressable
					style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
					onPress={toggleLanguage}
				>
					<Text style={styles.buttonText}>
						{t("settings.language")}: {getCurrentLanguage().toUpperCase()}
					</Text>
				</Pressable>
			</View>

			<View style={[styles.card, isDark && styles.cardDark]}>
				<Text style={[styles.cardTitle, isDark && styles.textDark]}>Theme Test</Text>
				<View style={styles.buttonRow}>
					<Pressable
						style={({ pressed }) => [
							styles.themeButton,
							isDark && styles.themeButtonDark,
							theme === "light" && styles.themeButtonActive,
							pressed && styles.buttonPressed,
						]}
						onPress={() => setTheme("light")}
					>
						<Text
							style={[
								styles.themeButtonText,
								isDark && styles.themeButtonTextDark,
								theme === "light" && styles.themeButtonTextActive,
							]}
						>
							Light
						</Text>
					</Pressable>
					<Pressable
						style={({ pressed }) => [
							styles.themeButton,
							isDark && styles.themeButtonDark,
							theme === "dark" && styles.themeButtonActive,
							pressed && styles.buttonPressed,
						]}
						onPress={() => setTheme("dark")}
					>
						<Text
							style={[
								styles.themeButtonText,
								isDark && styles.themeButtonTextDark,
								theme === "dark" && styles.themeButtonTextActive,
							]}
						>
							Dark
						</Text>
					</Pressable>
					<Pressable
						style={({ pressed }) => [
							styles.themeButton,
							isDark && styles.themeButtonDark,
							theme === "system" && styles.themeButtonActive,
							pressed && styles.buttonPressed,
						]}
						onPress={() => setTheme("system")}
					>
						<Text
							style={[
								styles.themeButtonText,
								isDark && styles.themeButtonTextDark,
								theme === "system" && styles.themeButtonTextActive,
							]}
						>
							System
						</Text>
					</Pressable>
				</View>
			</View>

			<View style={[styles.card, isDark && styles.cardDark]}>
				<Text style={[styles.cardTitle, isDark && styles.textDark]}>tRPC Test</Text>
				{isLoading ? (
					<Text style={[styles.cardText, isDark && styles.textDark]}>{t("common.loading")}</Text>
				) : isError ? (
					<Text style={styles.errorText}>{t("common.error")} - API not running?</Text>
				) : (
					<Text style={[styles.cardText, isDark && styles.textDark]}>{helloData?.message}</Text>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 20,
		padding: 16,
		backgroundColor: "#fff",
	},
	containerDark: {
		backgroundColor: "#1a1a1a",
	},
	card: {
		width: "100%",
		padding: 16,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		backgroundColor: "#fff",
	},
	cardDark: {
		backgroundColor: "#2a2a2a",
		borderColor: "#444",
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
		color: "#000",
	},
	cardText: {
		fontSize: 16,
		color: "#000",
	},
	textDark: {
		color: "#fff",
	},
	errorText: {
		fontSize: 16,
		color: "#ef4444",
	},
	button: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
		marginTop: 8,
	},
	buttonPressed: {
		opacity: 0.7,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
		textAlign: "center",
	},
	buttonRow: {
		flexDirection: "row",
		gap: 8,
	},
	themeButton: {
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ccc",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	themeButtonDark: {
		backgroundColor: "#2a2a2a",
		borderColor: "#444",
	},
	themeButtonActive: {
		backgroundColor: "#007AFF",
		borderColor: "#007AFF",
	},
	themeButtonText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
	},
	themeButtonTextDark: {
		color: "#fff",
	},
	themeButtonTextActive: {
		color: "#fff",
	},
});
