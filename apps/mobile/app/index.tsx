import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { setLanguage } from "@/lib/i18n";
import { useTranslation, getCurrentLanguage } from "@my-monorepo/i18n";

export default function Home() {
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
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>i18n Test</Text>
				<Text style={styles.cardText}>{t("common.welcome")}</Text>
				<Pressable
					style={({ pressed }) => [
						styles.button,
						pressed && styles.buttonPressed,
					]}
					onPress={toggleLanguage}
				>
					<Text style={styles.buttonText}>
						{t("settings.language")}: {getCurrentLanguage().toUpperCase()}
					</Text>
				</Pressable>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>tRPC Test</Text>
				{isLoading ? (
					<Text style={styles.cardText}>{t("common.loading")}</Text>
				) : (
					<Text style={styles.cardText}>{helloData?.message}</Text>
				)}
			</View>

			<Text style={styles.title}>Counter</Text>
			<Text style={styles.count}>{count}</Text>
			<Pressable
				style={({ pressed }) => [
					styles.button,
					pressed && styles.buttonPressed,
				]}
				onPress={() => setCount((c) => c + 1)}
			>
				<Text style={styles.buttonText}>Add 1</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 20,
	},
	card: {
		padding: 16,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		marginBottom: 20,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
	cardText: {
		fontSize: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
	},
	count: {
		fontSize: 48,
		fontWeight: "bold",
	},
	button: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	buttonPressed: {
		opacity: 0.7,
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
});
