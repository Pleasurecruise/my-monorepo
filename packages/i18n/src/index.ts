import { i18n, changeLanguage, getCurrentLanguage } from "./config";

export { i18n, changeLanguage, getCurrentLanguage };
export { useTranslation } from "react-i18next";
export type {
	SupportedLanguage,
	TranslationKey,
	TranslationResource,
} from "./types";

export const supportedLanguages = ["en", "zh"] as const;
