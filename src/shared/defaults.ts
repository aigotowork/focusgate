import type { AppSettings, RuleGroup } from "./types";
import { createDefaultSleepBlockPage } from "./block-page";
import { getCatalog } from "./i18n/catalogs";
import type { SupportedLocale } from "./i18n/locales";

export const DEFAULT_COMMITMENT = getCatalog("zh-CN").defaults.sleepCommitment;
export const DEFAULT_RULE_GROUP_ID = "goodnight-boundary";

export function createDefaultRuleGroup(locale: SupportedLocale = "zh-CN"): RuleGroup {
  const catalog = getCatalog(locale);
  return {
    id: DEFAULT_RULE_GROUP_ID,
    name: catalog.defaults.sleepRuleGroupName,
    enabled: true,
    schedule: {
      enabled: true,
      startTime: "23:00",
      endTime: "07:00",
      days: [0, 1, 2, 3, 4, 5, 6]
    },
    sites: [
      { id: "youtube-com", host: "youtube.com", createdAt: new Date(0).toISOString() },
      { id: "bilibili-com", host: "bilibili.com", createdAt: new Date(0).toISOString() },
      { id: "reddit-com", host: "reddit.com", createdAt: new Date(0).toISOString() }
    ],
    commitment: catalog.defaults.sleepCommitment,
    blockPage: createDefaultSleepBlockPage(locale),
    reminderMinutes: 30,
    blockMode: "standard",
    unlockMinutes: 10,
    maxUnlocksPerSession: 3,
    recordUnlockReason: true,
    createdAt: new Date(0).toISOString()
  };
}

export const DEFAULT_RULE_GROUP: RuleGroup = createDefaultRuleGroup("zh-CN");

export function createDefaultSettings(locale: SupportedLocale = "zh-CN"): AppSettings {
  return {
    ruleGroups: [createDefaultRuleGroup(locale)],
    unlocks: [],
    onboardingCompleted: false,
    remindedSessionIds: [],
    language: {
      preference: "auto"
    }
  };
}

export const DEFAULT_SETTINGS: AppSettings = createDefaultSettings("zh-CN");
