import type { AccessDecision, AppSettings, GuardEvent, SiteRule, UnlockDecision } from "./types";
import { getSleepSessionId, isScheduleActive } from "./time";

export function extractHostnameFromUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    return normalizeHost(url.hostname);
  } catch {
    return normalizeHost(value);
  }
}

export function normalizeHost(value: string): string | undefined {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return undefined;
  }

  const withoutProtocol = trimmed.replace(/^[a-z]+:\/\//, "");
  const host = withoutProtocol.split("/")[0].split(":")[0].replace(/^www\./, "");
  return host || undefined;
}

export function matchesSiteRule(host: string, rule: SiteRule): boolean {
  const normalizedRule = normalizeHost(rule.host);
  if (!normalizedRule) {
    return false;
  }

  return host === normalizedRule || host.endsWith(`.${normalizedRule}`);
}

export function createSiteRule(host: string): SiteRule | undefined {
  const normalizedHost = normalizeHost(host);
  if (!normalizedHost) {
    return undefined;
  }

  return {
    id: `${normalizedHost.replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    host: normalizedHost,
    createdAt: new Date().toISOString()
  };
}

export function evaluateAccess(url: string, settings: AppSettings, date = new Date()): AccessDecision {
  if (url.startsWith("chrome-extension://") || url.startsWith("moz-extension://")) {
    return { allowed: true, reason: "extension_page" };
  }

  const host = extractHostnameFromUrl(url);
  if (!host) {
    return { allowed: true, reason: "not_http" };
  }

  const sessionId = getSleepSessionId(settings.schedule, date);

  if (!settings.schedule.enabled) {
    return { allowed: true, reason: "disabled", host, sessionId };
  }

  if (settings.pauseUntil && new Date(settings.pauseUntil).getTime() > date.getTime()) {
    return { allowed: true, reason: "paused", host, sessionId };
  }

  if (!isScheduleActive(settings.schedule, date)) {
    return { allowed: true, reason: "outside_schedule", host, sessionId };
  }

  const unlock = settings.unlocks.find(
    (session) => matchesSiteRule(host, { id: session.host, host: session.host, createdAt: session.expiresAt }) &&
      new Date(session.expiresAt).getTime() > date.getTime()
  );
  if (unlock) {
    return { allowed: true, reason: "unlocked", host, sessionId };
  }

  const matchedRule = settings.sites.find((rule) => matchesSiteRule(host, rule));
  if (!matchedRule) {
    return { allowed: true, reason: "not_listed", host, sessionId };
  }

  return { allowed: false, reason: "blocked", host, sessionId };
}

export function evaluateUnlockLimit(
  settings: AppSettings,
  events: GuardEvent[],
  date = new Date()
): UnlockDecision {
  const sessionId = getSleepSessionId(settings.schedule, date);
  const used = events.filter((event) => event.type === "unlocked" && event.sessionId === sessionId).length;
  const limit = settings.maxUnlocksPerNight;

  return {
    allowed: limit <= 0 || used < limit,
    reason: limit <= 0 || used < limit ? "allowed" : "limit_reached",
    used,
    limit,
    sessionId
  };
}
