import { gateMarkSvg } from "../shared/brand";
import { formatDuration, getCatalog, getLocaleFromSettings } from "../shared/i18n";
import { evaluatePageReminder } from "../shared/sites";
import { getAppSettings } from "../shared/storage";
import type { AppSettings, PageReminderDecision } from "../shared/types";

const HOST_ID = "goodnight-guard-reminder-root";
const DISMISSED_KEY_PREFIX = "goodnightGuard.dismissedReminder";
const REFRESH_INTERVAL_MS = 30_000;

let hostElement: HTMLElement | undefined;
let shadowRoot: ShadowRoot | undefined;
let refreshTimer: number | undefined;

void refreshReminderOverlay();
refreshTimer = window.setInterval(() => void refreshReminderOverlay(), REFRESH_INTERVAL_MS);

if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes["goodnightGuard.settings"]) {
      void refreshReminderOverlay();
    }
  });
}

window.addEventListener("pagehide", () => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer);
  }
});

async function refreshReminderOverlay(): Promise<void> {
  const settings = await getAppSettings();
  const decision = evaluatePageReminder(window.location.href, settings);

  if (!decision.shouldShow || isDismissed(decision)) {
    removeOverlay();
    return;
  }

  renderOverlay(decision, settings);
}

function renderOverlay(decision: PageReminderDecision, settings: AppSettings): void {
  const locale = getLocaleFromSettings(settings);
  const t = getCatalog(locale);
  const root = ensureShadowRoot();
  root.textContent = "";

  const style = document.createElement("style");
  style.textContent = overlayStyles;

  const panel = document.createElement("aside");
  panel.setAttribute("role", "status");
  panel.setAttribute("aria-live", "polite");
  panel.className = "panel";

  const header = document.createElement("div");
  header.className = "header";

  const mark = document.createElement("div");
  mark.className = "mark";
  mark.setAttribute("aria-hidden", "true");
  mark.innerHTML = gateMarkSvg;

  const brand = document.createElement("span");
  brand.className = "brand";
  brand.textContent = t.brand.name;

  const spacer = document.createElement("span");
  spacer.className = "spacer";

  const closeButton = document.createElement("button");
  closeButton.className = "close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", t.reminder.closeAria);
  closeButton.textContent = "×";
  closeButton.addEventListener("click", () => {
    dismiss(decision);
    removeOverlay();
  });

  header.append(mark, brand, spacer, closeButton);

  const body = document.createElement("div");
  body.className = "body";

  const statusIcon = document.createElement("div");
  statusIcon.className = "statusIcon";
  statusIcon.setAttribute("aria-hidden", "true");
  statusIcon.innerHTML = bellIconSvg;

  const titleWrap = document.createElement("div");
  titleWrap.className = "titleWrap";

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = t.reminder.startsSoon(decision.ruleGroupName);

  const title = document.createElement("p");
  title.className = "title";
  title.textContent = t.reminder.entersAfter(formatDuration(decision.remainingMs ?? 0, locale));

  titleWrap.append(eyebrow, title);

  const message = document.createElement("p");
  message.className = "message";
  message.textContent = t.reminder.message(decision.ruleGroupName);

  const progress = document.createElement("div");
  progress.className = "progress";

  const progressMeta = document.createElement("div");
  progressMeta.className = "progressMeta";

  const progressLabel = document.createElement("span");
  progressLabel.textContent = t.reminder.progressLabel;

  const progressValue = document.createElement("span");
  progressValue.textContent = t.reminder.remaining(formatDuration(decision.remainingMs ?? 0, locale));

  progressMeta.append(progressLabel, progressValue);

  const progressTrack = document.createElement("div");
  progressTrack.className = "progressTrack";
  progressTrack.setAttribute("role", "progressbar");
  progressTrack.setAttribute("aria-label", t.reminder.progressAria);
  progressTrack.setAttribute("aria-valuemin", "0");
  progressTrack.setAttribute("aria-valuemax", "100");

  const remainingPercent = getReminderRemainingPercent(decision);
  progressTrack.setAttribute("aria-valuenow", String(Math.round(remainingPercent)));

  const progressBar = document.createElement("div");
  progressBar.className = "progressBar";
  progressBar.style.transform = `scaleX(${remainingPercent / 100})`;
  progressBar.style.animationDuration = `${Math.max(1, Math.ceil((decision.remainingMs ?? 0) / 1000))}s`;
  progressTrack.append(progressBar);
  progress.append(progressMeta, progressTrack);

  const commitment = document.createElement("blockquote");
  commitment.className = "commitment";
  commitment.textContent = decision.commitment?.trim() || t.reminder.fallbackCommitment;

  body.append(statusIcon, titleWrap, message, progress, commitment);

  const footer = document.createElement("div");
  footer.className = "footer";

  const site = document.createElement("span");
  site.className = "site";
  site.textContent = decision.host ?? window.location.hostname;

  const dismissButton = document.createElement("button");
  dismissButton.className = "dismiss";
  dismissButton.type = "button";
  dismissButton.textContent = t.reminder.dismiss;
  dismissButton.addEventListener("click", () => {
    dismiss(decision);
    removeOverlay();
  });

  footer.append(site, dismissButton);
  panel.append(header, body, footer);
  root.append(style, panel);
}

function ensureShadowRoot(): ShadowRoot {
  if (shadowRoot && hostElement?.isConnected) {
    return shadowRoot;
  }

  hostElement = document.getElementById(HOST_ID) ?? document.createElement("div");
  hostElement.id = HOST_ID;
  hostElement.style.position = "fixed";
  hostElement.style.zIndex = "2147483647";
  hostElement.style.right = "max(16px, env(safe-area-inset-right))";
  hostElement.style.bottom = "max(16px, env(safe-area-inset-bottom))";
  hostElement.style.width = "min(320px, calc(100vw - 32px))";
  hostElement.style.pointerEvents = "none";

  if (!hostElement.isConnected) {
    document.documentElement.append(hostElement);
  }

  shadowRoot = hostElement.shadowRoot ?? hostElement.attachShadow({ mode: "open" });
  return shadowRoot;
}

function removeOverlay(): void {
  shadowRoot?.replaceChildren();
  hostElement?.remove();
  hostElement = undefined;
  shadowRoot = undefined;
}

function dismiss(decision: PageReminderDecision): void {
  const key = getDismissKey(decision);
  if (!key) {
    return;
  }
  window.sessionStorage.setItem(key, "1");
}

function isDismissed(decision: PageReminderDecision): boolean {
  const key = getDismissKey(decision);
  return Boolean(key && window.sessionStorage.getItem(key));
}

function getDismissKey(decision: PageReminderDecision): string | undefined {
  if (!decision.ruleGroupId || !decision.sessionId || !decision.host) {
    return undefined;
  }
  return `${DISMISSED_KEY_PREFIX}:${decision.ruleGroupId}:${decision.sessionId}:${decision.host}`;
}

function getReminderRemainingPercent(decision: PageReminderDecision): number {
  const totalMs = Math.max(1, (decision.reminderMinutes ?? 0) * 60000);
  const remainingMs = Math.max(0, Math.min(totalMs, decision.remainingMs ?? totalMs));
  return Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
}

const bellIconSvg = `
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M10.3 21a2 2 0 0 0 3.4 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

const overlayStyles = `
  :host {
    all: initial;
  }

  .panel {
    pointer-events: auto;
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 24px 70px rgba(31, 41, 55, 0.12);
    color: #1e293b;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
    line-height: 1.5;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #e2e8f0;
    background: #fafaf9;
    padding: 12px 16px;
  }

  .mark {
    display: grid;
    width: 20px;
    height: 20px;
    place-items: center;
    color: #4f46e5;
    font-size: 12px;
    font-weight: 700;
  }

  .mark svg {
    width: 20px;
    height: 20px;
  }

  .brand {
    color: #020617;
    font-size: 16px;
    font-weight: 700;
  }

  .spacer {
    flex: 1 1 auto;
  }

  .close {
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    font: inherit;
    font-size: 22px;
    line-height: 1;
    transition: background-color 160ms ease, color 160ms ease;
  }

  .close:hover,
  .close:focus-visible {
    background: #f1f5f9;
    color: #0f172a;
    outline: none;
  }

  .body {
    padding: 20px;
    text-align: center;
  }

  .statusIcon {
    display: grid;
    width: 64px;
    height: 64px;
    margin: 0 auto 12px;
    place-items: center;
    border: 1px solid #c7d2fe;
    border-radius: 16px;
    background: #eef2ff;
    color: #f59e0b;
    font-size: 20px;
    font-weight: 700;
  }

  .statusIcon svg {
    width: 32px;
    height: 32px;
  }

  .titleWrap {
    min-width: 0;
  }

  .eyebrow,
  .title,
  .message,
  .commitment {
    margin: 0;
  }

  .eyebrow {
    overflow: hidden;
    color: #4f46e5;
    font-size: 12px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .title {
    margin-top: 2px;
    color: #020617;
    font-size: 18px;
    font-weight: 650;
    letter-spacing: 0;
  }

  .message {
    margin-top: 6px;
    color: #475569;
    font-size: 13px;
    line-height: 1.6;
  }

  .progress {
    margin-top: 14px;
    text-align: left;
  }

  .progressMeta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 7px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.3;
  }

  .progressMeta span:last-child {
    flex: 0 0 auto;
    color: #4338ca;
    font-weight: 650;
  }

  .progressTrack {
    width: 100%;
    height: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    background: #f1f5f9;
  }

  .progressBar {
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #818cf8 0%, #4f46e5 100%);
    transform-origin: left center;
    animation: goodnight-progress-drain linear forwards;
  }

  @keyframes goodnight-progress-drain {
    to {
      transform: scaleX(0);
    }
  }

  .commitment {
    margin-top: 16px;
    padding: 12px;
    border: 1px solid #e0e7ff;
    border-radius: 8px;
    background: rgba(238, 242, 255, 0.7);
    color: #312e81;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.6;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid #e2e8f0;
    background: rgba(250, 250, 249, 0.82);
    padding: 12px 16px;
  }

  .site {
    min-width: 0;
    overflow: hidden;
    color: #64748b;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dismiss {
    flex: 0 0 auto;
    border: 0;
    border-radius: 8px;
    background: #4f46e5;
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    padding: 8px 12px;
    transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
  }

  .dismiss:hover,
  .dismiss:focus-visible {
    background: #6366f1;
    color: #ffffff;
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.22);
  }

  @media (max-width: 420px) {
    .header {
      padding: 12px 14px;
    }

    .body {
      padding: 18px 16px;
    }

    .statusIcon {
      width: 58px;
      height: 58px;
    }

    .title {
      font-size: 17px;
    }

    .footer {
      padding-right: 14px;
      padding-left: 14px;
    }
  }
`;
