import { useState, useEffect } from "react";
import { i18n, changeLanguage, getCurrentLanguage, t as translate } from "@my-monorepo/i18n/core";
import type { SupportedLanguage, TranslationKey } from "@my-monorepo/i18n/core";
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

export function useTranslation() {
	const [language, setLang] = useState(getCurrentLanguage());

	useEffect(() => {
		const handleLanguageChange = (lng: string) => {
			setLang(lng as SupportedLanguage);
		};

		i18n.on("languageChanged", handleLanguageChange);
		return () => {
			i18n.off("languageChanged", handleLanguageChange);
		};
	}, []);

	const t = (key: TranslationKey): string => translate(key);

	return { t, language };
}

export { getCurrentLanguage };
