export { getCatalog } from "./catalogs";
export { formatCount, formatDuration, formatMinutes, formatTime, formatWeekday } from "./format";
export {
  CHROME_LOCALE_FOLDERS,
  DEFAULT_LANGUAGE_PREFERENCE,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  normalizeLanguagePreference,
  toChromeLocaleFolder,
  type LanguagePreference,
  type SupportedLocale
} from "./locales";
export { getPopupStatusCopy } from "./popup-status";
export { getNavigatorLanguages, matchSupportedLocale, resolveLocale } from "./resolve-locale";
export { getBackgroundBrowserLanguages, getLocaleFromSettings, resolveBackgroundLocale } from "./runtime";
export type { LocaleCatalog, PopupStatusCopy } from "./types";
