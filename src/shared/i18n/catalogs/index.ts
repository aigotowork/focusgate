import { en } from "./en";
import { zhCN } from "./zh-CN";
import type { SupportedLocale } from "../locales";
import type { LocaleCatalog } from "../types";

export const CATALOGS: Record<SupportedLocale, LocaleCatalog> = {
  "zh-CN": zhCN,
  en
};

export function getCatalog(locale: SupportedLocale): LocaleCatalog {
  return CATALOGS[locale];
}
