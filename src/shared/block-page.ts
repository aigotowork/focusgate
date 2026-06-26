import type {
  BlockPageConfig,
  BlockPagePrimaryActionConfig,
  BlockPagePrimaryActionType,
  RuleGroup
} from "./types";
import { getCatalog } from "./i18n/catalogs";
import type { SupportedLocale } from "./i18n/locales";

export const MAX_CUSTOM_HTML_BYTES = 100 * 1024;
export const MAX_EXTERNAL_URL_CHARS = 2048;

export const DEFAULT_CLOSE_PRIMARY_ACTION: BlockPagePrimaryActionConfig = {
  type: "close",
  externalUrl: "",
  handoffTitle: "下一步",
  handoffHtml: ""
};

export const DEFAULT_SLEEP_BLOCK_PAGE: BlockPageConfig = createDefaultSleepBlockPage("zh-CN");

export const DEFAULT_FOCUS_BLOCK_PAGE: BlockPageConfig = createDefaultFocusBlockPage("zh-CN");

export interface BlockPageTemplateContext {
  groupName: string;
  site: string;
  commitment: string;
  unlockMinutes: number;
  time?: string;
}

export interface BlockPageNormalizeOptions {
  preserveDraftExternalUrl?: boolean;
}

export function createDefaultSleepBlockPage(locale: SupportedLocale): BlockPageConfig {
  const copy = getCatalog(locale).blockPageDefaults.sleep;
  return {
    version: 1,
    title: copy.title,
    description: copy.description,
    primaryActionLabel: copy.primaryActionLabel,
    primaryAction: {
      ...DEFAULT_CLOSE_PRIMARY_ACTION,
      handoffTitle: copy.handoffTitle
    },
    tone: "sleep",
    customHtmlEnabled: false,
    customHtml: ""
  };
}

export function createDefaultFocusBlockPage(locale: SupportedLocale): BlockPageConfig {
  const copy = getCatalog(locale).blockPageDefaults.focus;
  return {
    version: 1,
    title: copy.title,
    description: copy.description,
    primaryActionLabel: copy.primaryActionLabel,
    primaryAction: {
      ...DEFAULT_CLOSE_PRIMARY_ACTION,
      handoffTitle: copy.handoffTitle
    },
    tone: "focus",
    customHtmlEnabled: false,
    customHtml: ""
  };
}

export function getDefaultBlockPageForRuleGroup(
  group: Pick<Partial<RuleGroup>, "id" | "name">,
  locale: SupportedLocale = "zh-CN"
): BlockPageConfig {
  const marker = `${group.id ?? ""} ${group.name ?? ""}`.toLowerCase();
  if (
    marker.includes("goodnight") ||
    marker.includes("sleep") ||
    marker.includes("晚安") ||
    marker.includes("睡") ||
    marker.includes("bedtime")
  ) {
    return createDefaultSleepBlockPage(locale);
  }
  return createDefaultFocusBlockPage(locale);
}

export function normalizeBlockPageConfig(
  value: Partial<BlockPageConfig> | undefined,
  fallback: BlockPageConfig,
  options: BlockPageNormalizeOptions = {}
): BlockPageConfig {
  const customHtml = typeof value?.customHtml === "string" ? value.customHtml : "";
  const canStoreCustomHtml = customHtml.trim().length > 0 && getUtf8ByteLength(customHtml) <= MAX_CUSTOM_HTML_BYTES;
  return {
    version: 1,
    title: normalizeText(value?.title, fallback.title),
    description: normalizeText(value?.description, fallback.description),
    primaryActionLabel: normalizeText(value?.primaryActionLabel, fallback.primaryActionLabel),
    primaryAction: normalizePrimaryActionConfig(value?.primaryAction, fallback.primaryAction, options),
    tone: isBlockPageTone(value?.tone) ? value.tone : fallback.tone,
    customHtmlEnabled: Boolean(value?.customHtmlEnabled && canStoreCustomHtml),
    customHtml: canStoreCustomHtml ? customHtml : ""
  };
}

export function normalizePrimaryActionConfig(
  value: Partial<BlockPagePrimaryActionConfig> | undefined,
  fallback: BlockPagePrimaryActionConfig = DEFAULT_CLOSE_PRIMARY_ACTION,
  options: BlockPageNormalizeOptions = {}
): BlockPagePrimaryActionConfig {
  const type = isPrimaryActionType(value?.type) ? value.type : fallback.type;
  const handoffHtml = typeof value?.handoffHtml === "string" ? value.handoffHtml : fallback.handoffHtml;
  const canStoreHandoffHtml =
    handoffHtml.trim().length > 0 && getUtf8ByteLength(handoffHtml) <= MAX_CUSTOM_HTML_BYTES;

  return {
    type,
    externalUrl: normalizeExternalUrl(value?.externalUrl ?? fallback.externalUrl, options.preserveDraftExternalUrl ?? false),
    handoffTitle: normalizeText(value?.handoffTitle, fallback.handoffTitle),
    handoffHtml: canStoreHandoffHtml ? handoffHtml : ""
  };
}

export function canRenderCustomHtml(config: BlockPageConfig): boolean {
  return config.customHtmlEnabled && config.customHtml.trim().length > 0 && getUtf8ByteLength(config.customHtml) <= MAX_CUSTOM_HTML_BYTES;
}

export function canRenderHandoffHtml(action: BlockPagePrimaryActionConfig): boolean {
  return action.handoffHtml.trim().length > 0 && getUtf8ByteLength(action.handoffHtml) <= MAX_CUSTOM_HTML_BYTES;
}

export function getExecutableExternalUrl(action: BlockPagePrimaryActionConfig): string | undefined {
  if (action.type !== "external_url" || !action.externalUrl) {
    return undefined;
  }

  try {
    const url = new URL(action.externalUrl);
    return isHttpUrl(url) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function buildSandboxedCustomHtml(html: string, context: BlockPageTemplateContext): string {
  const interpolated = interpolateBlockPageHtml(html, context);
  const securityHead = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data: blob:; font-src data:;">',
    "<style>html,body{margin:0;min-height:100%;}body{overflow-wrap:anywhere;}</style>"
  ].join("");

  if (/<head\b[^>]*>/i.test(interpolated)) {
    return interpolated.replace(/<head\b[^>]*>/i, (match) => `${match}${securityHead}`);
  }

  if (/<html\b[^>]*>/i.test(interpolated)) {
    return interpolated.replace(/<html\b[^>]*>/i, (match) => `${match}<head>${securityHead}</head>`);
  }

  return `<!doctype html><html><head>${securityHead}</head><body>${interpolated}</body></html>`;
}

export function interpolateBlockPageHtml(html: string, context: BlockPageTemplateContext): string {
  const replacements: Record<string, string> = {
    groupName: context.groupName,
    site: context.site,
    commitment: context.commitment,
    unlockMinutes: String(context.unlockMinutes),
    time: context.time ?? ""
  };

  return html.replace(/\{\{\s*(groupName|site|commitment|unlockMinutes|time)\s*\}\}/g, (_, key: string) =>
    escapeHtml(replacements[key] ?? "")
  );
}

export function cloneBlockPageConfig(config: BlockPageConfig): BlockPageConfig {
  return {
    ...config,
    primaryAction: { ...config.primaryAction }
  };
}

export function getUtf8ByteLength(value: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }

  return unescape(encodeURIComponent(value)).length;
}

function normalizeText(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function isBlockPageTone(value: unknown): value is BlockPageConfig["tone"] {
  return value === "sleep" || value === "focus" || value === "calm" || value === "strict";
}

function isPrimaryActionType(value: unknown): value is BlockPagePrimaryActionType {
  return value === "close" || value === "external_url" || value === "handoff_html";
}

function normalizeExternalUrl(value: string | undefined, preserveDraft: boolean): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed.length > MAX_EXTERNAL_URL_CHARS) {
    return "";
  }
  if (preserveDraft) {
    if (trimmed.startsWith("//")) {
      return "";
    }
    const protocolMatch = trimmed.match(/^([a-z][a-z\d+.-]*):/i);
    if (protocolMatch && !/^https?$/i.test(protocolMatch[1])) {
      return "";
    }
    return trimmed;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return "";
  }
  return trimmed;
}

function isHttpUrl(url: URL): boolean {
  return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.length > 0;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
