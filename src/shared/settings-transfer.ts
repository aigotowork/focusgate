import packageMetadata from "../../package.json";
import { normalizeStoredSettings } from "./storage";
import type { AppSettings, RuleGroup } from "./types";
import type { SupportedLocale } from "./i18n/locales";

export const SETTINGS_EXPORT_SCHEMA = "focusgate.settings.export";
export const SETTINGS_EXPORT_VERSION = 1;

export type SettingsImportMode = "merge" | "replace";
export type SettingsTransferErrorCode = "empty_rule_groups" | "invalid_json" | "invalid_schema" | "unsupported_version";

export interface SettingsExportFile {
  schema: typeof SETTINGS_EXPORT_SCHEMA;
  version: typeof SETTINGS_EXPORT_VERSION;
  exportedAt: string;
  appVersion: string;
  settings: TransferableSettings;
}

export interface SettingsImportSummary {
  ruleGroupCount: number;
  addedRuleGroupCount: number;
  replacedRuleGroupCount: number;
  removedRuleGroupCount: number;
}

type TransferableSettings = Pick<AppSettings, "ruleGroups" | "onboardingCompleted" | "language">;

export class SettingsTransferError extends Error {
  readonly code: SettingsTransferErrorCode;

  constructor(code: SettingsTransferErrorCode) {
    super(code);
    this.name = "SettingsTransferError";
    this.code = code;
  }
}

export function buildSettingsExport(
  settings: AppSettings,
  selectedRuleGroupIds: string[],
  exportedAt = new Date()
): SettingsExportFile {
  const selectedIds = new Set(selectedRuleGroupIds);
  const selectedRuleGroups = settings.ruleGroups.filter((group) => selectedIds.has(group.id));
  if (selectedRuleGroups.length === 0) {
    throw new SettingsTransferError("empty_rule_groups");
  }

  return {
    schema: SETTINGS_EXPORT_SCHEMA,
    version: SETTINGS_EXPORT_VERSION,
    exportedAt: exportedAt.toISOString(),
    appVersion: packageMetadata.version,
    settings: toTransferableSettings({
      ...settings,
      ruleGroups: selectedRuleGroups
    })
  };
}

export function stringifySettingsExport(file: SettingsExportFile): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}

export function getSettingsExportFileName(exportedAt = new Date()): string {
  const stamp = exportedAt.toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
  return `focusgate-settings-${stamp}.json`;
}

export function parseSettingsImport(fileText: string, defaultLocale: SupportedLocale = "zh-CN"): SettingsExportFile {
  let raw: unknown;
  try {
    raw = JSON.parse(fileText);
  } catch {
    throw new SettingsTransferError("invalid_json");
  }

  if (!isRecord(raw) || raw.schema !== SETTINGS_EXPORT_SCHEMA || !isRecord(raw.settings)) {
    throw new SettingsTransferError("invalid_schema");
  }
  if (raw.version !== SETTINGS_EXPORT_VERSION) {
    throw new SettingsTransferError("unsupported_version");
  }
  validateTransferableSettingsShape(raw.settings);

  const normalized = normalizeStoredSettings(raw.settings as Parameters<typeof normalizeStoredSettings>[0], defaultLocale);
  if (normalized.ruleGroups.length === 0) {
    throw new SettingsTransferError("empty_rule_groups");
  }

  return {
    schema: SETTINGS_EXPORT_SCHEMA,
    version: SETTINGS_EXPORT_VERSION,
    exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : new Date().toISOString(),
    appVersion: typeof raw.appVersion === "string" ? raw.appVersion : "",
    settings: toTransferableSettings(normalized)
  };
}

export function mergeImportedSettings(
  current: AppSettings,
  imported: SettingsExportFile,
  mode: SettingsImportMode
): AppSettings {
  const importedSettings = stripTransientState(imported.settings);

  if (mode === "replace") {
    return importedSettings;
  }

  const importedGroupIds = new Set(importedSettings.ruleGroups.map((group) => group.id));
  return stripTransientState({
    ...current,
    onboardingCompleted: current.onboardingCompleted || importedSettings.onboardingCompleted,
    language: importedSettings.language,
    ruleGroups: [
      ...current.ruleGroups.filter((group) => !importedGroupIds.has(group.id)),
      ...importedSettings.ruleGroups
    ]
  });
}

export function summarizeSettingsImport(current: AppSettings, imported: SettingsExportFile): SettingsImportSummary {
  const currentGroupIds = new Set(current.ruleGroups.map((group) => group.id));
  const replacedRuleGroupCount = imported.settings.ruleGroups.filter((group) => currentGroupIds.has(group.id)).length;
  return {
    ruleGroupCount: imported.settings.ruleGroups.length,
    addedRuleGroupCount: imported.settings.ruleGroups.length - replacedRuleGroupCount,
    replacedRuleGroupCount,
    removedRuleGroupCount: current.ruleGroups.length - replacedRuleGroupCount
  };
}

function validateTransferableSettingsShape(settings: Record<string, unknown>): void {
  if (settings.onboardingCompleted !== undefined && typeof settings.onboardingCompleted !== "boolean") {
    throw new SettingsTransferError("invalid_schema");
  }
  if (settings.language !== undefined) {
    if (!isRecord(settings.language) || typeof settings.language.preference !== "string") {
      throw new SettingsTransferError("invalid_schema");
    }
  }
  if (!Array.isArray(settings.ruleGroups)) {
    throw new SettingsTransferError("invalid_schema");
  }
  if (settings.ruleGroups.length === 0) {
    throw new SettingsTransferError("empty_rule_groups");
  }

  const ids = new Set<string>();
  for (const group of settings.ruleGroups) {
    validateRuleGroupShape(group);
    const id = (group as Record<string, unknown>).id as string;
    if (ids.has(id)) {
      throw new SettingsTransferError("invalid_schema");
    }
    ids.add(id);
  }
}

function validateRuleGroupShape(value: unknown): void {
  if (!isRecord(value)) {
    throw new SettingsTransferError("invalid_schema");
  }

  if (typeof value.id !== "string" || value.id.trim().length === 0) {
    throw new SettingsTransferError("invalid_schema");
  }
  const stringFields = ["name", "commitment", "createdAt"] as const;
  const numberFields = ["reminderMinutes", "unlockMinutes", "maxUnlocksPerSession"] as const;
  for (const field of stringFields) {
    if (value[field] !== undefined && typeof value[field] !== "string") {
      throw new SettingsTransferError("invalid_schema");
    }
  }
  for (const field of numberFields) {
    if (value[field] !== undefined && (typeof value[field] !== "number" || Number.isNaN(value[field]))) {
      throw new SettingsTransferError("invalid_schema");
    }
  }
  if (value.enabled !== undefined && typeof value.enabled !== "boolean") {
    throw new SettingsTransferError("invalid_schema");
  }
  if (value.recordUnlockReason !== undefined && typeof value.recordUnlockReason !== "boolean") {
    throw new SettingsTransferError("invalid_schema");
  }
  if (
    value.blockMode !== undefined &&
    value.blockMode !== "gentle" &&
    value.blockMode !== "standard" &&
    value.blockMode !== "strict"
  ) {
    throw new SettingsTransferError("invalid_schema");
  }
  if (value.schedule !== undefined) {
    validateScheduleShape(value.schedule);
  }
  if (value.sites !== undefined) {
    validateSiteRulesShape(value.sites);
  }
  if (value.blockPage !== undefined && !isRecord(value.blockPage)) {
    throw new SettingsTransferError("invalid_schema");
  }
}

function validateScheduleShape(value: unknown): void {
  if (!isRecord(value)) {
    throw new SettingsTransferError("invalid_schema");
  }
  if (typeof value.enabled !== "boolean" || typeof value.startTime !== "string" || typeof value.endTime !== "string") {
    throw new SettingsTransferError("invalid_schema");
  }
  if (!Array.isArray(value.days) || !value.days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)) {
    throw new SettingsTransferError("invalid_schema");
  }
}

function validateSiteRulesShape(value: unknown): void {
  if (!Array.isArray(value)) {
    throw new SettingsTransferError("invalid_schema");
  }
  for (const site of value) {
    if (!isRecord(site) || typeof site.id !== "string" || typeof site.host !== "string" || typeof site.createdAt !== "string") {
      throw new SettingsTransferError("invalid_schema");
    }
  }
}

function toTransferableSettings(settings: AppSettings): TransferableSettings {
  return {
    ruleGroups: settings.ruleGroups.map(cloneRuleGroup),
    onboardingCompleted: settings.onboardingCompleted,
    language: {
      preference: settings.language.preference
    }
  };
}

function stripTransientState(settings: TransferableSettings | AppSettings): AppSettings {
  return {
    ...settings,
    ruleGroups: settings.ruleGroups.map(cloneRuleGroup),
    unlocks: [],
    remindedSessionIds: [],
    pauseUntil: undefined
  };
}

function cloneRuleGroup(group: RuleGroup): RuleGroup {
  return {
    ...group,
    schedule: {
      ...group.schedule,
      days: [...group.schedule.days]
    },
    sites: group.sites.map((site) => ({ ...site })),
    blockPage: {
      ...group.blockPage,
      primaryAction: {
        ...group.blockPage.primaryAction
      }
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
