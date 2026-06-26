import { DEFAULT_LOCALE, isSupportedLocale, type LanguagePreference, type SupportedLocale } from "./locales";

export interface ResolveLocaleInput {
  preference: LanguagePreference;
  browserLanguages?: readonly string[];
  fallbackLocale?: SupportedLocale;
}

export function resolveLocale({
  preference,
  browserLanguages = [],
  fallbackLocale = DEFAULT_LOCALE
}: ResolveLocaleInput): SupportedLocale {
  if (preference !== "auto") {
    return preference;
  }

  for (const language of browserLanguages) {
    const match = matchSupportedLocale(language);
    if (match) {
      return match;
    }
  }

  return fallbackLocale;
}

export function matchSupportedLocale(value: string | undefined): SupportedLocale | undefined {
  const normalized = normalizeLocaleCode(value);
  if (!normalized) {
    return undefined;
  }

  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  if (normalized === "zh" || normalized.startsWith("zh-")) {
    return "zh-CN";
  }

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }

  return undefined;
}

export function getNavigatorLanguages(): string[] {
  if (typeof navigator === "undefined") {
    return [];
  }

  const languages = Array.isArray(navigator.languages) ? navigator.languages : [];
  if (languages.length > 0) {
    return [...languages];
  }

  return navigator.language ? [navigator.language] : [];
}

function normalizeLocaleCode(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  const parts = trimmed.replace(/_/g, "-").split("-");
  if (parts.length === 0 || !parts[0]) {
    return undefined;
  }

  const language = parts[0].toLowerCase();
  if (language === "zh") {
    return ["zh", ...parts.slice(1).map(normalizeLocalePart)].join("-");
  }
  if (language === "en") {
    return ["en", ...parts.slice(1).map((part) => part.toUpperCase())].join("-");
  }
  return [language, ...parts.slice(1).map(normalizeLocalePart)].join("-");
}

function normalizeLocalePart(part: string): string {
  if (part.length === 2) {
    return part.toUpperCase();
  }
  if (part.length === 4) {
    return `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`;
  }
  return part;
}
