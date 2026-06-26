import type { PopupPageContext } from "../types";
import { getCatalog } from "./catalogs";
import type { SupportedLocale } from "./locales";
import type { PopupStatusCopy } from "./types";

export function getPopupStatusCopy(context: PopupPageContext, locale: SupportedLocale): PopupStatusCopy {
  const entry = getCatalog(locale).popup.status[context.status];
  return {
    label: entry.label,
    detail: entry.detail(context)
  };
}
