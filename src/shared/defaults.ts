import type { AppSettings, RuleGroup } from "./types";
import { DEFAULT_SLEEP_BLOCK_PAGE } from "./block-page";

export const DEFAULT_COMMITMENT = "明天早上的我，会感谢现在睡觉的我。";
export const DEFAULT_RULE_GROUP_ID = "goodnight-boundary";

export const DEFAULT_RULE_GROUP: RuleGroup = {
  id: DEFAULT_RULE_GROUP_ID,
  name: "晚安守护",
  enabled: true,
  schedule: {
    enabled: true,
    startTime: "23:00",
    endTime: "07:00",
    days: [0, 1, 2, 3, 4, 5, 6]
  },
  sites: [
    { id: "youtube-com", host: "youtube.com", createdAt: new Date(0).toISOString() },
    { id: "bilibili-com", host: "bilibili.com", createdAt: new Date(0).toISOString() },
    { id: "reddit-com", host: "reddit.com", createdAt: new Date(0).toISOString() }
  ],
  commitment: DEFAULT_COMMITMENT,
  blockPage: DEFAULT_SLEEP_BLOCK_PAGE,
  reminderMinutes: 30,
  blockMode: "standard",
  unlockMinutes: 10,
  maxUnlocksPerSession: 3,
  recordUnlockReason: true,
  createdAt: new Date(0).toISOString()
};

export const DEFAULT_SETTINGS: AppSettings = {
  ruleGroups: [DEFAULT_RULE_GROUP],
  unlocks: [],
  onboardingCompleted: false,
  remindedSessionIds: []
};
