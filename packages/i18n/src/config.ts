import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { SupportedLanguage } from "./types";
import en from "./locales/en";
import zh from "./locales/zh";

const resources = {
	en: { translation: en },
	zh: { translation: zh },
};

i18n.use(initReactI18next).init({
	resources,
	lng: "en",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
});

export { i18n };

export function changeLanguage(lang: SupportedLanguage) {
	return i18n.changeLanguage(lang);
}

export function getCurrentLanguage(): SupportedLanguage {
	return i18n.language as SupportedLanguage;
}
