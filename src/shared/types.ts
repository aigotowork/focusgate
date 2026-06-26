export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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
  expiresAt: string;
}

export interface AppSettings {
  schedule: SleepSchedule;
  sites: SiteRule[];
  unlocks: UnlockSession[];
  commitment: string;
  unlockMinutes: number;
  pauseUntil?: string;
}

export interface GuardEvent {
  id: string;
  type: "blocked" | "unlocked" | "site_added" | "paused";
  host: string;
  createdAt: string;
}

export interface AccessDecision {
  allowed: boolean;
  reason: "not_http" | "disabled" | "outside_schedule" | "paused" | "unlocked" | "not_listed" | "blocked";
  host?: string;
}
