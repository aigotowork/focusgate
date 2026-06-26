import type { LanguagePreference } from "./i18n/locales";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type BlockMode = "gentle" | "standard" | "strict";
export type BlockPageTone = "sleep" | "focus" | "calm" | "strict";
export type BlockPagePrimaryActionType = "close" | "external_url" | "handoff_html";
export type UnlockReason = "work" | "study" | "urgent" | "other";

export interface SleepSchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  days: Weekday[];
}

export interface SiteRule {
  id: string;
  host: string;
  createdAt: string;
}

export interface BlockPageConfig {
  version: 1;
  title: string;
  description: string;
  primaryActionLabel: string;
  primaryAction: BlockPagePrimaryActionConfig;
  tone: BlockPageTone;
  customHtmlEnabled: boolean;
  customHtml: string;
}

export interface BlockPagePrimaryActionConfig {
  type: BlockPagePrimaryActionType;
  externalUrl: string;
  handoffTitle: string;
  handoffHtml: string;
}

export interface RuleGroup {
  id: string;
  name: string;
  enabled: boolean;
  schedule: SleepSchedule;
  sites: SiteRule[];
  commitment: string;
  blockPage: BlockPageConfig;
  reminderMinutes: number;
  blockMode: BlockMode;
  unlockMinutes: number;
  maxUnlocksPerSession: number;
  recordUnlockReason: boolean;
  createdAt: string;
}

export interface UnlockSession {
  ruleGroupId: string;
  host: string;
  unlockedAt: string;
  expiresAt: string;
  durationMinutes: number;
  reason?: UnlockReason;
  mode: BlockMode;
  sessionId: string;
}

export interface AppLanguageSettings {
  preference: LanguagePreference;
}

export interface AppSettings {
  ruleGroups: RuleGroup[];
  unlocks: UnlockSession[];
  onboardingCompleted: boolean;
  remindedSessionIds: string[];
  language: AppLanguageSettings;
  pauseUntil?: string;
}

export interface GuardEvent {
  id: string;
  type: "blocked" | "unlocked" | "site_added" | "paused" | "reminded" | "cleared";
  host: string;
  createdAt: string;
  sessionId?: string;
  ruleGroupId?: string;
  ruleGroupName?: string;
  reason?: UnlockReason;
}

export interface AccessDecision {
  allowed: boolean;
  reason:
    | "extension_page"
    | "not_http"
    | "disabled"
    | "outside_schedule"
    | "paused"
    | "unlocked"
    | "not_listed"
    | "blocked";
  host?: string;
  sessionId?: string;
  ruleGroupId?: string;
  ruleGroupName?: string;
  blockMode?: BlockMode;
}

export interface ReminderDecision {
  shouldRemind: boolean;
  reason: "disabled" | "outside_window" | "already_reminded" | "ready";
  sessionId?: string;
  ruleGroupId?: string;
  ruleGroupName?: string;
  reminderMinutes?: number;
}

export interface ReminderWindowState {
  active: boolean;
  startsAt?: string;
  endsAt?: string;
  remainingMs?: number;
  sessionId?: string;
}

export interface PageReminderDecision {
  shouldShow: boolean;
  reason:
    | "extension_page"
    | "not_http"
    | "disabled"
    | "paused"
    | "not_listed"
    | "outside_window"
    | "already_blocked"
    | "ready";
  host?: string;
  ruleGroupId?: string;
  ruleGroupName?: string;
  commitment?: string;
  reminderMinutes?: number;
  remainingMs?: number;
  sessionId?: string;
  scheduleStartAt?: string;
  blockMode?: BlockMode;
}

export type PopupPageStatus =
  | "loading"
  | "blocked"
  | "unlocked"
  | "upcoming"
  | "outside_schedule"
  | "not_listed"
  | "paused"
  | "inactive"
  | "not_http";

export interface PopupPageContext {
  host: string;
  status: PopupPageStatus;
  matchedRuleGroupId?: string;
  matchedRuleGroupName?: string;
  selectedRuleGroupId?: string;
  selectedRuleGroupName?: string;
  canAddToSelectedGroup: boolean;
  activeRuleGroupCount: number;
  upcomingRuleGroupCount: number;
}

export interface UnlockDecision {
  allowed: boolean;
  reason: "allowed" | "limit_reached";
  used: number;
  limit: number;
  sessionId: string;
  ruleGroupId: string;
}

export interface DailyStats {
  date: string;
  blocked: number;
  unlocked: number;
}

export interface StatsSummary {
  todayBlocked: number;
  todayUnlocked: number;
  tonightBlocked: number;
  tonightUnlocked: number;
  lastSevenDays: DailyStats[];
  topBlockedHosts: Array<{ host: string; count: number }>;
  latestBlockAt?: string;
}
