import { changeLanguage } from "@my-monorepo/i18n";
import type { SupportedLanguage } from "@my-monorepo/i18n";
import { getLocales } from "expo-localization";

export function initI18n() {
	const locales = getLocales();
	const deviceLang = locales[0]?.languageCode?.toLowerCase();

	if (deviceLang?.startsWith("zh")) {
		void changeLanguage("zh");
	}
}

export function setLanguage(lang: SupportedLanguage) {
	return changeLanguage(lang);
}
