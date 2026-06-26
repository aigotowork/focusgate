import { DEFAULT_SETTINGS } from "./defaults";
import type { AppSettings, GuardEvent, SiteRule, UnlockSession } from "./types";

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

function mergeSettings(value?: Partial<AppSettings>): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...value,
    schedule: {
      ...DEFAULT_SETTINGS.schedule,
      ...value?.schedule,
      days: value?.schedule?.days ?? DEFAULT_SETTINGS.schedule.days
    },
    sites: value?.sites ?? DEFAULT_SETTINGS.sites,
    unlocks: value?.unlocks ?? [],
    commitment: value?.commitment ?? DEFAULT_SETTINGS.commitment,
    unlockMinutes: value?.unlockMinutes ?? DEFAULT_SETTINGS.unlockMinutes
  };
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
  return mergeSettings(store[SETTINGS_KEY]);
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

export async function addSiteRule(rule: SiteRule): Promise<AppSettings> {
  return updateAppSettings((settings) => {
    const exists = settings.sites.some((site) => site.host === rule.host);
    return exists ? settings : { ...settings, sites: [...settings.sites, rule] };
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
