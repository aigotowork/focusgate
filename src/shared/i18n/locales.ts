export const SUPPORTED_LOCALES = ["zh-CN", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type LanguagePreference = "auto" | SupportedLocale;

export const DEFAULT_LOCALE: SupportedLocale = "zh-CN";
export const DEFAULT_LANGUAGE_PREFERENCE: LanguagePreference = "auto";

export const CHROME_LOCALE_FOLDERS: Record<SupportedLocale, string> = {
  "zh-CN": "zh_CN",
  en: "en"
};

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function normalizeLanguagePreference(value: unknown): LanguagePreference {
  if (value === "auto" || isSupportedLocale(value)) {
    return value;
  }
  return DEFAULT_LANGUAGE_PREFERENCE;
}

export function toChromeLocaleFolder(locale: SupportedLocale): string {
  return CHROME_LOCALE_FOLDERS[locale];
}
