import {
  ensureDefaultSettings,
  markSessionReminded,
  recordGuardEvent,
  updateAppSettings
} from "../shared/storage";
import { evaluateAccess } from "../shared/sites";
import { evaluateReminder, getNextReminderDate, getNextScheduleStartDate } from "../shared/time";
import type { AppSettings } from "../shared/types";

const SCHEDULE_TICK_ALARM = "scheduleTick";
const CLEANUP_UNLOCKS_ALARM = "cleanupUnlocks";

chrome.runtime.onInstalled.addListener(() => {
  void handleInstalled();
});

chrome.runtime.onStartup.addListener(() => {
  void scheduleNextTick();
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0 || details.tabId < 0) {
    return;
  }

  void handleNavigation(details.tabId, details.url);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SCHEDULE_TICK_ALARM) {
    void handleScheduleTick();
  }

  if (alarm.name === CLEANUP_UNLOCKS_ALARM) {
    void cleanupUnlocks();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes["goodnightGuard.settings"]) {
    void scheduleNextTick();
  }
});

async function handleInstalled(): Promise<void> {
  const settings = await ensureDefaultSettings();
  await scheduleNextTick(settings);
  await chrome.alarms.create(CLEANUP_UNLOCKS_ALARM, { periodInMinutes: 5 });

  if (!settings.onboardingCompleted) {
    await chrome.tabs.create({ url: chrome.runtime.getURL("options.html?onboarding=1") });
  }
}

async function handleNavigation(tabId: number, url: string, existingSettings?: AppSettings): Promise<void> {
  const settings = existingSettings ?? (await ensureDefaultSettings());
  await checkReminderForUrl(url, settings);
  const decision = evaluateAccess(url, settings);

  if (decision.allowed || !decision.host) {
    return;
  }

  await recordGuardEvent({
    type: "blocked",
    host: decision.host,
    sessionId: decision.sessionId,
    ruleGroupId: decision.ruleGroupId,
    ruleGroupName: decision.ruleGroupName
  });
  const blockUrl = chrome.runtime.getURL(
    `block.html?site=${encodeURIComponent(decision.host)}&group=${encodeURIComponent(decision.ruleGroupId ?? "")}&target=${encodeURIComponent(url)}`
  );
  await chrome.tabs.update(tabId, { url: blockUrl });
}

async function handleScheduleTick(): Promise<void> {
  const settings = await ensureDefaultSettings();
  await checkReminder(settings);
  await enforceOpenTabs(settings);
  await scheduleNextTick(settings);
}

async function checkReminder(settings?: AppSettings): Promise<void> {
  const currentSettings = settings ?? (await ensureDefaultSettings());
  for (const group of currentSettings.ruleGroups) {
    await maybeNotifyReminder(group.id, currentSettings);
  }
}

async function checkReminderForUrl(url: string, settings: AppSettings): Promise<void> {
  for (const group of settings.ruleGroups) {
    if (evaluateAccess(url, { ...settings, ruleGroups: [group] }).reason === "outside_schedule") {
      await maybeNotifyReminder(group.id, settings);
    }
  }
}

async function maybeNotifyReminder(ruleGroupId: string, settings: AppSettings): Promise<void> {
  const group = settings.ruleGroups.find((item) => item.id === ruleGroupId);
  if (!group) {
    return;
  }

  const decision = evaluateReminder(group, settings.remindedSessionIds);
  if (!decision.shouldRemind || !decision.sessionId || !decision.ruleGroupId) {
    return;
  }

  await chrome.notifications.create(`goodnight-reminder-${decision.ruleGroupId}-${decision.sessionId}`, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon-128.png"),
    title: `${decision.ruleGroupName}即将开启`,
    message: `${decision.reminderMinutes} 分钟后进入限制时间。现在可以收尾，准备切换状态了。`
  });
  await markSessionReminded(decision.ruleGroupId, decision.sessionId);
  await recordGuardEvent({
    type: "reminded",
    host: "*",
    sessionId: decision.sessionId,
    ruleGroupId: decision.ruleGroupId,
    ruleGroupName: decision.ruleGroupName
  });
}

async function enforceOpenTabs(settings?: AppSettings): Promise<void> {
  const currentSettings = settings ?? (await ensureDefaultSettings());
  const tabs = await chrome.tabs.query({ url: ["http://*/*", "https://*/*"] });
  for (const tab of tabs) {
    if (typeof tab.id !== "number" || !tab.url) {
      continue;
    }
    await handleNavigation(tab.id, tab.url, currentSettings);
  }
}

async function cleanupUnlocks(): Promise<void> {
  const now = Date.now();
  await updateAppSettings((settings) => ({
    ...settings,
    unlocks: settings.unlocks.filter((unlock) => new Date(unlock.expiresAt).getTime() > now)
  }));
  await scheduleNextTick();
}

async function scheduleNextTick(settings?: AppSettings): Promise<void> {
  const currentSettings = settings ?? (await ensureDefaultSettings());
  const now = new Date();
  const candidates = currentSettings.ruleGroups
    .flatMap((group) => [getNextReminderDate(group, now), getNextScheduleStartDate(group, now)])
    .filter((date): date is Date => Boolean(date));

  await chrome.alarms.clear(SCHEDULE_TICK_ALARM);
  const next = candidates.sort((a, b) => a.getTime() - b.getTime())[0];
  if (next) {
    await chrome.alarms.create(SCHEDULE_TICK_ALARM, { when: next.getTime() });
  }
}
