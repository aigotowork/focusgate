import type { AccessDecision, AppSettings, BlockMode, GuardEvent, RuleGroup, SiteRule, UnlockDecision } from "./types";
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

  if (settings.pauseUntil && new Date(settings.pauseUntil).getTime() > date.getTime()) {
    return { allowed: true, reason: "paused", host };
  }

  const activeGroups = settings.ruleGroups.filter((group) => group.enabled && group.schedule.enabled);
  if (activeGroups.length === 0) {
    return { allowed: true, reason: "disabled", host };
  }

  const matchingGroups = activeGroups.filter(
    (group) => isScheduleActive(group.schedule, date) && group.sites.some((rule) => matchesSiteRule(host, rule))
  );
  if (matchingGroups.length === 0) {
    const hasHostRule = activeGroups.some((group) => group.sites.some((rule) => matchesSiteRule(host, rule)));
    return { allowed: true, reason: hasHostRule ? "outside_schedule" : "not_listed", host };
  }

  const blockedGroups = matchingGroups.filter((group) => !hasActiveUnlock(settings, group, host, date));
  if (blockedGroups.length === 0) {
    const group = chooseRuleGroup(matchingGroups);
    return {
      allowed: true,
      reason: "unlocked",
      host,
      sessionId: getSleepSessionId(group.schedule, date),
      ruleGroupId: group.id,
      ruleGroupName: group.name,
      blockMode: group.blockMode
    };
  }

  const group = chooseRuleGroup(blockedGroups);
  return {
    allowed: false,
    reason: "blocked",
    host,
    sessionId: getSleepSessionId(group.schedule, date),
    ruleGroupId: group.id,
    ruleGroupName: group.name,
    blockMode: group.blockMode
  };
}

export function evaluateUnlockLimit(
  group: RuleGroup,
  events: GuardEvent[],
  date = new Date()
): UnlockDecision {
  const sessionId = getSleepSessionId(group.schedule, date);
  const used = events.filter(
    (event) => event.type === "unlocked" && event.sessionId === sessionId && event.ruleGroupId === group.id
  ).length;
  const limit = group.maxUnlocksPerSession;

  return {
    allowed: limit <= 0 || used < limit,
    reason: limit <= 0 || used < limit ? "allowed" : "limit_reached",
    used,
    limit,
    sessionId,
    ruleGroupId: group.id
  };
}

export function getRuleGroupById(settings: AppSettings, id: string | undefined): RuleGroup | undefined {
  return settings.ruleGroups.find((group) => group.id === id);
}

export function chooseRuleGroup(groups: RuleGroup[]): RuleGroup {
  return [...groups].sort((a, b) => modeRank(b.blockMode) - modeRank(a.blockMode))[0];
}

function hasActiveUnlock(settings: AppSettings, group: RuleGroup, host: string, date: Date): boolean {
  return settings.unlocks.some(
    (session) =>
      session.ruleGroupId === group.id &&
      matchesSiteRule(host, { id: session.host, host: session.host, createdAt: session.expiresAt }) &&
      new Date(session.expiresAt).getTime() > date.getTime()
  );
}

function modeRank(mode: BlockMode): number {
  if (mode === "strict") {
    return 3;
  }
  if (mode === "standard") {
    return 2;
  }
  return 1;
}
