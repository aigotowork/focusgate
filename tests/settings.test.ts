import { describe, expect, it } from "vitest";
import { DEFAULT_RULE_GROUP_ID } from "../src/shared/defaults";
import { normalizeStoredSettings } from "../src/shared/storage";

describe("settings migration", () => {
  it("migrates legacy single-rule settings into the default rule group", () => {
    const settings = normalizeStoredSettings({
      schedule: {
        enabled: true,
        startTime: "22:30",
        endTime: "06:30",
        days: [1, 2, 3, 4, 5]
      },
      sites: [{ id: "bilibili", host: "bilibili.com", createdAt: "" }],
      commitment: "工作时间不要刷视频。",
      unlockMinutes: 5,
      reminderMinutes: 15,
      blockMode: "strict",
      maxUnlocksPerNight: 1,
      recordUnlockReason: false
    });

    expect(settings.ruleGroups).toHaveLength(1);
    expect(settings.ruleGroups[0]).toMatchObject({
      id: DEFAULT_RULE_GROUP_ID,
      name: "晚安边界",
      commitment: "工作时间不要刷视频。",
      unlockMinutes: 5,
      reminderMinutes: 15,
      blockMode: "strict",
      maxUnlocksPerSession: 1,
      recordUnlockReason: false
    });
    expect(settings.ruleGroups[0].sites[0].host).toBe("bilibili.com");
  });
});
