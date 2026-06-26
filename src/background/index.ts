import { ensureDefaultSettings, recordGuardEvent } from "../shared/storage";
import { evaluateAccess } from "../shared/sites";

chrome.runtime.onInstalled.addListener(() => {
  void ensureDefaultSettings();
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0 || details.tabId < 0) {
    return;
  }

  void handleNavigation(details.tabId, details.url);
});

async function handleNavigation(tabId: number, url: string): Promise<void> {
  const settings = await ensureDefaultSettings();
  const decision = evaluateAccess(url, settings);

  if (decision.allowed || !decision.host) {
    return;
  }

  await recordGuardEvent({ type: "blocked", host: decision.host });
  const blockUrl = chrome.runtime.getURL(
    `block.html?site=${encodeURIComponent(decision.host)}&target=${encodeURIComponent(url)}`
  );
  await chrome.tabs.update(tabId, { url: blockUrl });
}
