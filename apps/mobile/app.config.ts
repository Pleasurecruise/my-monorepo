import type { ConfigContext } from "expo/config";

export default ({ config }: ConfigContext) => ({
	...config,
	name: "mobile",
	slug: "mobile",
	version: "1.0.0",
	orientation: "portrait",
	scheme: "mobile",
	userInterfaceStyle: "automatic",
	newArchEnabled: true,
	ios: {
		supportsTablet: true,
		bundleIdentifier: "com.pleasure1234.mobile",
	},
	android: {
		edgeToEdgeEnabled: true,
		package: "com.pleasure1234.mobile",
		adaptiveIcon: {
			backgroundColor: "#ffffff",
		},
	},
	web: {
		output: "static",
	},
	plugins: [
		"expo-router",
		"expo-secure-store",
		[
			"expo-web-browser",
			{
				redirectScheme: "mobile",
			},
		],
	],
	experiments: {
		typedRoutes: true,
	},
});
