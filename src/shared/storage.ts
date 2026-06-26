import { DEFAULT_SETTINGS, createDefaultSettings } from "./defaults";
import { getDefaultBlockPageForRuleGroup, normalizeBlockPageConfig } from "./block-page";
import { normalizeLanguagePreference, type SupportedLocale } from "./i18n/locales";
import type { AppSettings, GuardEvent, RuleGroup, SiteRule, UnlockSession } from "./types";

const SETTINGS_KEY = "goodnightGuard.settings";
const EVENTS_KEY = "goodnightGuard.events";
const MAX_EVENTS = 200;

type StorageShape = {
  [SETTINGS_KEY]?: Partial<AppSettings>;
  [EVENTS_KEY]?: GuardEvent[];
};

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local);
}

type LegacyRuleGroup = Omit<Partial<RuleGroup>, "blockPage"> & {
  blockPage?: Partial<RuleGroup["blockPage"]>;
};

type LegacySettings = Omit<Partial<AppSettings>, "ruleGroups"> & {
  ruleGroups?: LegacyRuleGroup[];
  schedule?: RuleGroup["schedule"];
  sites?: SiteRule[];
  commitment?: string;
  blockPage?: Partial<RuleGroup["blockPage"]>;
  unlockMinutes?: number;
  reminderMinutes?: number;
  blockMode?: RuleGroup["blockMode"];
  maxUnlocksPerNight?: number;
  recordUnlockReason?: boolean;
};

export function normalizeStoredSettings(value?: LegacySettings, defaultLocale: SupportedLocale = "zh-CN"): AppSettings {
  const defaults = createDefaultSettings(defaultLocale);
  const ruleGroups = normalizeRuleGroups(value, defaults.ruleGroups[0]);
  return {
    ...defaults,
    ...value,
    ruleGroups,
    unlocks: value?.unlocks ?? [],
    onboardingCompleted: value?.onboardingCompleted ?? defaults.onboardingCompleted,
    remindedSessionIds: value?.remindedSessionIds ?? [],
    language: {
      preference: normalizeLanguagePreference(value?.language?.preference)
    }
  };
}

function normalizeRuleGroups(value: LegacySettings | undefined, defaultRuleGroup: RuleGroup): RuleGroup[] {
  if (value?.ruleGroups && value.ruleGroups.length > 0) {
    return value.ruleGroups.map((group) => {
      const fallbackBlockPage = getDefaultBlockPageForRuleGroup(group);
      return {
        ...defaultRuleGroup,
        ...group,
        schedule: {
          ...defaultRuleGroup.schedule,
          ...group.schedule,
          days: group.schedule?.days ?? defaultRuleGroup.schedule.days
        },
        sites: group.sites ?? [],
        blockPage: normalizeBlockPageConfig(group.blockPage, fallbackBlockPage),
        maxUnlocksPerSession: group.maxUnlocksPerSession ?? defaultRuleGroup.maxUnlocksPerSession
      };
    });
  }

  if (value?.schedule || value?.sites || value?.commitment) {
    return [
      {
        ...defaultRuleGroup,
        schedule: {
          ...defaultRuleGroup.schedule,
          ...value.schedule,
          days: value.schedule?.days ?? defaultRuleGroup.schedule.days
        },
        sites: value.sites ?? defaultRuleGroup.sites,
        commitment: value.commitment ?? defaultRuleGroup.commitment,
        blockPage: normalizeBlockPageConfig(value.blockPage, defaultRuleGroup.blockPage),
        unlockMinutes: value.unlockMinutes ?? defaultRuleGroup.unlockMinutes,
        reminderMinutes: value.reminderMinutes ?? defaultRuleGroup.reminderMinutes,
        blockMode: value.blockMode ?? defaultRuleGroup.blockMode,
        maxUnlocksPerSession: value.maxUnlocksPerNight ?? defaultRuleGroup.maxUnlocksPerSession,
        recordUnlockReason: value.recordUnlockReason ?? defaultRuleGroup.recordUnlockReason
      }
    ];
  }

  return [defaultRuleGroup];
}

function localGet(): StorageShape {
  if (typeof localStorage === "undefined") {
    return {};
  }

  return {
    [SETTINGS_KEY]: JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null") ?? undefined,
    [EVENTS_KEY]: JSON.parse(localStorage.getItem(EVENTS_KEY) ?? "[]")
  };
}

async function storageGet(keys: string[]): Promise<StorageShape> {
  if (!hasChromeStorage()) {
    return localGet();
  }

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(result as StorageShape);
    });
  });
}

async function storageSet(value: StorageShape): Promise<void> {
  if (!hasChromeStorage()) {
    if (typeof localStorage !== "undefined") {
      if (SETTINGS_KEY in value) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(value[SETTINGS_KEY]));
      }
      if (EVENTS_KEY in value) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(value[EVENTS_KEY]));
      }
    }
    return;
  }

  await new Promise<void>((resolve, reject) => {
    chrome.storage.local.set(value, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve();
    });
  });
}

export async function getAppSettings(): Promise<AppSettings> {
  const store = await storageGet([SETTINGS_KEY]);
  return normalizeStoredSettings(store[SETTINGS_KEY]);
}

export async function hasStoredAppSettings(): Promise<boolean> {
  const store = await storageGet([SETTINGS_KEY]);
  return Boolean(store[SETTINGS_KEY]);
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await storageSet({ [SETTINGS_KEY]: settings });
}

export async function updateAppSettings(updater: (settings: AppSettings) => AppSettings): Promise<AppSettings> {
  const current = await getAppSettings();
  const next = updater(current);
  await saveAppSettings(next);
  return next;
}

export async function ensureDefaultSettings(): Promise<AppSettings> {
  const settings = await getAppSettings();
  await saveAppSettings(settings);
  return settings;
}

export async function addSiteRule(rule: SiteRule, ruleGroupId?: string): Promise<AppSettings> {
  return updateAppSettings((settings) => {
    const targetId = ruleGroupId ?? settings.ruleGroups[0]?.id;
    return {
      ...settings,
      ruleGroups: settings.ruleGroups.map((group) => {
        if (group.id !== targetId) {
          return group;
        }
        const exists = group.sites.some((site) => site.host === rule.host);
        return exists ? group : { ...group, sites: [...group.sites, rule] };
      })
    };
  });
}

export async function addUnlockSession(session: UnlockSession): Promise<AppSettings> {
  return updateAppSettings((settings) => ({
    ...settings,
    unlocks: [
      ...settings.unlocks.filter((unlock) => new Date(unlock.expiresAt).getTime() > Date.now()),
      session
    ]
  }));
}

export async function pauseGuard(minutes: number): Promise<AppSettings> {
  return updateAppSettings((settings) => ({
    ...settings,
    pauseUntil: new Date(Date.now() + minutes * 60000).toISOString()
  }));
}

export async function markSessionReminded(ruleGroupId: string, sessionId: string): Promise<AppSettings> {
  const reminderKey = getReminderKey(ruleGroupId, sessionId);
  return updateAppSettings((settings) => ({
    ...settings,
    remindedSessionIds: Array.from(new Set([...settings.remindedSessionIds, reminderKey])).slice(-60)
  }));
}

export async function getGuardEvents(): Promise<GuardEvent[]> {
  const store = await storageGet([EVENTS_KEY]);
  return store[EVENTS_KEY] ?? [];
}

export async function recordGuardEvent(event: Omit<GuardEvent, "id" | "createdAt">): Promise<GuardEvent> {
  const nextEvent: GuardEvent = {
    ...event,
    id: `${event.type}-${event.host}-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  const current = await getGuardEvents();
  await storageSet({ [EVENTS_KEY]: [nextEvent, ...current].slice(0, MAX_EVENTS) });
  return nextEvent;
}

export async function clearGuardData(): Promise<void> {
  const settings = await getAppSettings();
  await storageSet({
    [SETTINGS_KEY]: {
      ...settings,
      unlocks: [],
      pauseUntil: undefined,
      remindedSessionIds: []
    },
    [EVENTS_KEY]: []
  });
}

export function getReminderKey(ruleGroupId: string, sessionId: string): string {
  return `${ruleGroupId}:${sessionId}`;
}
