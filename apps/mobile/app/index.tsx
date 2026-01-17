import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function Home() {
	const [count, setCount] = useState(0);

	return (
		<View style={styles.container}>
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
