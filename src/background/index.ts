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

async function checkReminder(): Promise<void> {
  const settings = await ensureDefaultSettings();
  for (const group of settings.ruleGroups) {
    const decision = evaluateReminder(group, settings.remindedSessionIds);

    if (!decision.shouldRemind || !decision.sessionId || !decision.ruleGroupId) {
      continue;
    }

    await chrome.notifications.create(`goodnight-reminder-${decision.ruleGroupId}-${decision.sessionId}`, {
      type: "basic",
      iconUrl: chrome.runtime.getURL("icon.svg"),
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
}

async function cleanupUnlocks(): Promise<void> {
  const now = Date.now();
  await updateAppSettings((settings) => ({
    ...settings,
    unlocks: settings.unlocks.filter((unlock) => new Date(unlock.expiresAt).getTime() > now)
  }));
}
