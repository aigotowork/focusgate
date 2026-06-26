import type { AppSettings } from "../types";
import { DEFAULT_LOCALE, normalizeLanguagePreference, type SupportedLocale } from "./locales";
import { getNavigatorLanguages, resolveLocale } from "./resolve-locale";

export function getLocaleFromSettings(settings: AppSettings, browserLanguages = getNavigatorLanguages()): SupportedLocale {
  return resolveLocale({
    preference: normalizeLanguagePreference(settings.language.preference),
    browserLanguages
  });
}

export async function getBackgroundBrowserLanguages(): Promise<string[]> {
  if (typeof chrome === "undefined" || !chrome.i18n) {
    return [];
  }

  if (typeof chrome.i18n.getAcceptLanguages === "function") {
    try {
      const languages = await new Promise<string[]>((resolve) => {
        chrome.i18n.getAcceptLanguages((items) => resolve(items));
      });
      if (languages.length > 0) {
        return languages;
      }
    } catch {
      // Fall through to the UI language below.
    }
  }

  if (typeof chrome.i18n.getUILanguage === "function") {
    const uiLanguage = chrome.i18n.getUILanguage();
    return uiLanguage ? [uiLanguage] : [];
  }

  return [];
}

export async function resolveBackgroundLocale(preference = "auto" as const): Promise<SupportedLocale> {
  return resolveLocale({
    preference,
    browserLanguages: await getBackgroundBrowserLanguages(),
    fallbackLocale: DEFAULT_LOCALE
  });
}
