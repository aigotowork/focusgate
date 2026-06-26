import type {
  AccessDecision,
  AppSettings,
  BlockMode,
  GuardEvent,
  PageReminderDecision,
  PopupPageContext,
  RuleGroup,
  SiteRule,
  UnlockDecision
} from "./types";
import { BRAND } from "./brand";
import { getReminderWindowState, getSleepSessionId, isScheduleActive } from "./time";

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

export function evaluatePageReminder(url: string, settings: AppSettings, date = new Date()): PageReminderDecision {
  if (url.startsWith("chrome-extension://") || url.startsWith("moz-extension://")) {
    return { shouldShow: false, reason: "extension_page" };
  }

  const host = extractHostnameFromUrl(url);
  if (!host) {
    return { shouldShow: false, reason: "not_http" };
  }

  if (settings.pauseUntil && new Date(settings.pauseUntil).getTime() > date.getTime()) {
    return { shouldShow: false, reason: "paused", host };
  }

  const activeGroups = settings.ruleGroups.filter((group) => group.enabled && group.schedule.enabled);
  if (activeGroups.length === 0) {
    return { shouldShow: false, reason: "disabled", host };
  }

  const hostGroups = activeGroups.filter((group) => group.sites.some((rule) => matchesSiteRule(host, rule)));
  if (hostGroups.length === 0) {
    return { shouldShow: false, reason: "not_listed", host };
  }

  if (hostGroups.some((group) => isScheduleActive(group.schedule, date) && !hasActiveUnlock(settings, group, host, date))) {
    return { shouldShow: false, reason: "already_blocked", host };
  }

  const candidates = hostGroups
    .map((group) => ({ group, reminder: getReminderWindowState(group.schedule, group.reminderMinutes, date) }))
    .filter(({ group, reminder }) => {
      if (!reminder.active || !reminder.endsAt) {
        return false;
      }
      return !hasActiveUnlock(settings, group, host, new Date(reminder.endsAt));
    });

  if (candidates.length === 0) {
    return { shouldShow: false, reason: "outside_window", host };
  }

  const { group, reminder } = candidates.sort((a, b) => {
    const timeDelta =
      (a.reminder.remainingMs ?? Number.MAX_SAFE_INTEGER) - (b.reminder.remainingMs ?? Number.MAX_SAFE_INTEGER);
    if (timeDelta !== 0) {
      return timeDelta;
    }
    const modeDelta = modeRank(b.group.blockMode) - modeRank(a.group.blockMode);
    if (modeDelta !== 0) {
      return modeDelta;
    }
    return 0;
  })[0];

  return {
    shouldShow: true,
    reason: "ready",
    host,
    ruleGroupId: group.id,
    ruleGroupName: group.name,
    commitment: group.commitment,
    reminderMinutes: group.reminderMinutes,
    remainingMs: reminder.remainingMs,
    sessionId: reminder.sessionId,
    scheduleStartAt: reminder.endsAt,
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

export function getPopupPageContext(settings: AppSettings, url: string | undefined, date = new Date()): PopupPageContext {
  const host = url ? extractHostnameFromUrl(url) : undefined;
  const decision = url ? evaluateAccess(url, settings, date) : undefined;
  const reminder = url ? evaluatePageReminder(url, settings, date) : undefined;
  const activeGroups = settings.ruleGroups.filter((group) => group.enabled && isScheduleActive(group.schedule, date));
  const upcomingGroups = settings.ruleGroups.filter(
    (group) => group.enabled && getReminderWindowState(group.schedule, group.reminderMinutes, date).active
  );
  const hostGroups = host
    ? settings.ruleGroups.filter(
        (group) => group.enabled && group.schedule.enabled && group.sites.some((rule) => matchesSiteRule(host, rule))
      )
    : [];
  const listedGroup = hostGroups.length > 0 ? chooseRuleGroup(hostGroups) : undefined;
  const matchedRuleGroupId =
    decision?.ruleGroupId ?? (reminder?.shouldShow ? reminder.ruleGroupId : undefined) ?? listedGroup?.id;
  const matchedRuleGroupName =
    decision?.ruleGroupName ?? (reminder?.shouldShow ? reminder.ruleGroupName : undefined) ?? listedGroup?.name;
  const selectedGroup =
    getRuleGroupById(settings, matchedRuleGroupId) ??
    settings.ruleGroups.find((group) => group.enabled) ??
    settings.ruleGroups[0];
  const listedInSelectedGroup =
    Boolean(host && selectedGroup?.sites.some((rule) => matchesSiteRule(host, rule)));
  const base = {
    host: host ?? "当前页面",
    matchedRuleGroupId,
    matchedRuleGroupName,
    selectedRuleGroupId: selectedGroup?.id,
    canAddToSelectedGroup: Boolean(host && selectedGroup && !listedInSelectedGroup),
    activeRuleGroupCount: activeGroups.length,
    upcomingRuleGroupCount: upcomingGroups.length
  };

  if (!url || !host || decision?.reason === "not_http" || decision?.reason === "extension_page") {
    return {
      ...base,
      status: "not_http",
      statusLabel: "当前页面不可加入",
      statusDetail: "请切换到普通网页后再管理规则组。"
    };
  }

  if (decision?.reason === "paused") {
    return {
      ...base,
      status: "paused",
      statusLabel: `${BRAND.nameZh}已暂停`,
      statusDetail: "暂停结束后，命中的规则组会继续生效。"
    };
  }

  if (decision?.allowed === false) {
    return {
      ...base,
      status: "blocked",
      statusLabel: "当前页面会被阻断",
      statusDetail: matchedRuleGroupName ? `${matchedRuleGroupName} 正在保护这个网站。` : "有规则正在保护这个网站。"
    };
  }

  if (decision?.reason === "unlocked") {
    return {
      ...base,
      status: "unlocked",
      statusLabel: "当前页面已临时解锁",
      statusDetail: matchedRuleGroupName ? `${matchedRuleGroupName} 的临时解锁仍在有效期内。` : "临时解锁仍在有效期内。"
    };
  }

  if (reminder?.shouldShow) {
    return {
      ...base,
      status: "upcoming",
      statusLabel: "当前页面即将受限",
      statusDetail: matchedRuleGroupName ? `${matchedRuleGroupName} 即将开始，请准备收尾。` : "限制规则即将开始，请准备收尾。"
    };
  }

  if (decision?.reason === "outside_schedule") {
    return {
      ...base,
      status: "outside_schedule",
      statusLabel: "当前页面在规则时间外",
      statusDetail: "这个网站已加入规则组，但现在不是限制时段。"
    };
  }

  if (decision?.reason === "disabled") {
    return {
      ...base,
      status: "inactive",
      statusLabel: "没有启用的限制规则",
      statusDetail: `启用规则组后，${BRAND.nameZh}会按时间自动执行。`
    };
  }

  return {
    ...base,
    status: "not_listed",
    statusLabel: "当前页面未加入规则",
    statusDetail: selectedGroup ? `可以把它加入 ${selectedGroup.name}。` : "请先创建一个规则组。"
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
