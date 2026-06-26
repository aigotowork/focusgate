import type { AppSettings } from "./types";

export const DEFAULT_COMMITMENT = "明天早上的我，会感谢现在睡觉的我。";

export const DEFAULT_SETTINGS: AppSettings = {
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
  unlocks: [],
  commitment: DEFAULT_COMMITMENT,
  unlockMinutes: 10
};
