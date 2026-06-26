import {
  ensureDefaultSettings,
  markSessionReminded,
  recordGuardEvent,
  updateAppSettings
} from "../shared/storage";
import { evaluateAccess } from "../shared/sites";
import { evaluateReminder } from "../shared/time";

chrome.runtime.onInstalled.addListener(() => {
  void handleInstalled();
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0 || details.tabId < 0) {
    return;
  }

  void handleNavigation(details.tabId, details.url);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkReminder") {
    void checkReminder();
  }

  if (alarm.name === "cleanupUnlocks") {
    void cleanupUnlocks();
  }
});

async function handleInstalled(): Promise<void> {
  const settings = await ensureDefaultSettings();
  await chrome.alarms.create("checkReminder", { periodInMinutes: 1 });
  await chrome.alarms.create("cleanupUnlocks", { periodInMinutes: 5 });

  if (!settings.onboardingCompleted) {
    await chrome.tabs.create({ url: chrome.runtime.getURL("options.html?onboarding=1") });
  }
}

async function handleNavigation(tabId: number, url: string): Promise<void> {
  const settings = await ensureDefaultSettings();
  const decision = evaluateAccess(url, settings);

  if (decision.allowed || !decision.host) {
    return;
  }

  await recordGuardEvent({ type: "blocked", host: decision.host, sessionId: decision.sessionId });
  const blockUrl = chrome.runtime.getURL(
    `block.html?site=${encodeURIComponent(decision.host)}&target=${encodeURIComponent(url)}`
  );
  await chrome.tabs.update(tabId, { url: blockUrl });
}

async function checkReminder(): Promise<void> {
  const settings = await ensureDefaultSettings();
  const decision = evaluateReminder(settings.schedule, settings.reminderMinutes, settings.remindedSessionIds);

  if (!decision.shouldRemind || !decision.sessionId) {
    return;
  }

  await chrome.notifications.create(`goodnight-reminder-${decision.sessionId}`, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icon.svg"),
    title: "晚安边界即将开启",
    message: `${settings.reminderMinutes} 分钟后进入晚安时间。现在可以收尾，准备休息了。`
  });
  await markSessionReminded(decision.sessionId);
  await recordGuardEvent({ type: "reminded", host: "*", sessionId: decision.sessionId });
}

async function cleanupUnlocks(): Promise<void> {
  const now = Date.now();
  await updateAppSettings((settings) => ({
    ...settings,
    unlocks: settings.unlocks.filter((unlock) => new Date(unlock.expiresAt).getTime() > now)
  }));
}
