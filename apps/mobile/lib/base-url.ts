import Constants from "expo-constants";

/**
 * 获取 API 服务器的 base URL。
 * 开发时从 Expo 调试器的 hostUri 中提取 IP 地址（适配真机/模拟器）。
 * 生产时需要手动配置实际的 API 地址。
 */
export function getBaseUrl(): string {
	const debuggerHost = Constants.expoConfig?.hostUri;
	const localhost = debuggerHost?.split(":")[0];

	if (!localhost) {
		// TODO: 生产环境设置实际的 API 地址
		// e.g. return "https://api.example.com";
		return "http://localhost:5173";
	}

	return `http://${localhost}:5173`;
}
