import React, { createContext, useContext, useMemo } from "react";
import type { AppSettings } from "../types";
import { getCatalog } from "./catalogs";
import { getNavigatorLanguages, resolveLocale } from "./resolve-locale";
import type { LocaleCatalog } from "./types";
import type { SupportedLocale } from "./locales";

export interface I18nContextValue {
  locale: SupportedLocale;
  t: LocaleCatalog;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({
  settings,
  children
}: {
  settings: AppSettings | undefined;
  children: React.ReactNode;
}): JSX.Element {
  const value = useMemo<I18nContextValue>(() => {
    const locale = resolveLocale({
      preference: settings?.language.preference ?? "auto",
      browserLanguages: getNavigatorLanguages()
    });
    return {
      locale,
      t: getCatalog(locale)
    };
  }, [settings?.language.preference]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}
