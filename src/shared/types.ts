export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type BlockMode = "gentle" | "standard" | "strict";
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

export interface UnlockSession {
  host: string;
  unlockedAt: string;
  expiresAt: string;
  durationMinutes: number;
  reason?: UnlockReason;
  mode: BlockMode;
  sessionId: string;
}

export interface AppSettings {
  schedule: SleepSchedule;
  sites: SiteRule[];
  unlocks: UnlockSession[];
  commitment: string;
  unlockMinutes: number;
  reminderMinutes: number;
  blockMode: BlockMode;
  maxUnlocksPerNight: number;
  recordUnlockReason: boolean;
  onboardingCompleted: boolean;
  remindedSessionIds: string[];
  pauseUntil?: string;
}

export interface GuardEvent {
  id: string;
  type: "blocked" | "unlocked" | "site_added" | "paused" | "reminded" | "cleared";
  host: string;
  createdAt: string;
  sessionId?: string;
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
}

export interface ReminderDecision {
  shouldRemind: boolean;
  reason: "disabled" | "outside_window" | "already_reminded" | "ready";
  sessionId?: string;
}

export interface UnlockDecision {
  allowed: boolean;
  reason: "allowed" | "limit_reached";
  used: number;
  limit: number;
  sessionId: string;
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
