import { describe, expect, it } from "vitest";
import { DEFAULT_RULE_GROUP_ID } from "../src/shared/defaults";
import { MAX_CUSTOM_HTML_BYTES } from "../src/shared/block-page";
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
    expect(settings.ruleGroups[0].blockPage.title).toBe("现在是晚安时间");
    expect(settings.ruleGroups[0].blockPage.primaryAction).toMatchObject({ type: "close", externalUrl: "" });
  });

  it("adds a generic block page to existing non-sleep rule groups", () => {
    const settings = normalizeStoredSettings({
      ruleGroups: [
        {
          id: "work-focus",
          name: "工作时间专注",
          enabled: true,
          schedule: { enabled: true, startTime: "09:00", endTime: "18:00", days: [1, 2, 3, 4, 5] },
          sites: [],
          commitment: "先把重要的事做完。",
          reminderMinutes: 15,
          blockMode: "standard",
          unlockMinutes: 10,
          maxUnlocksPerSession: 3,
          recordUnlockReason: true,
          createdAt: ""
        }
      ]
    });

    expect(settings.ruleGroups[0].blockPage).toMatchObject({
      title: "现在是限制时间",
      tone: "focus",
      customHtmlEnabled: false,
      primaryAction: { type: "close" }
    });
  });

  it("drops empty or oversized custom HTML during normalization", () => {
    const oversizedHtml = "x".repeat(MAX_CUSTOM_HTML_BYTES + 1);
    const settings = normalizeStoredSettings({
      ruleGroups: [
        {
          id: "work-focus",
          name: "工作时间专注",
          enabled: true,
          schedule: { enabled: true, startTime: "09:00", endTime: "18:00", days: [1, 2, 3, 4, 5] },
          sites: [],
          commitment: "先把重要的事做完。",
          blockPage: {
            title: "专注时间",
            description: "回到正事。",
            primaryActionLabel: "关闭",
            tone: "focus",
            customHtmlEnabled: true,
            customHtml: oversizedHtml
          },
          reminderMinutes: 15,
          blockMode: "standard",
          unlockMinutes: 10,
          maxUnlocksPerSession: 3,
          recordUnlockReason: true,
          createdAt: ""
        }
      ]
    });

    expect(settings.ruleGroups[0].blockPage.customHtmlEnabled).toBe(false);
    expect(settings.ruleGroups[0].blockPage.customHtml).toBe("");
  });

  it("keeps safe external primary actions during normalization", () => {
    const settings = normalizeStoredSettings({
      ruleGroups: [
        {
          id: "work-focus",
          name: "工作时间专注",
          enabled: true,
          schedule: { enabled: true, startTime: "09:00", endTime: "18:00", days: [1, 2, 3, 4, 5] },
          sites: [],
          commitment: "先把重要的事做完。",
          blockPage: {
            title: "专注时间",
            description: "回到正事。",
            primaryActionLabel: "打开工作清单",
            primaryAction: {
              type: "external_url",
              externalUrl: "https://example.com/todo",
              handoffTitle: "工作清单",
              handoffHtml: ""
            },
            tone: "focus",
            customHtmlEnabled: false,
            customHtml: ""
          },
          reminderMinutes: 15,
          blockMode: "standard",
          unlockMinutes: 10,
          maxUnlocksPerSession: 3,
          recordUnlockReason: true,
          createdAt: ""
        }
      ]
    });

    expect(settings.ruleGroups[0].blockPage.primaryAction).toMatchObject({
      type: "external_url",
      externalUrl: "https://example.com/todo"
    });
  });

  it("drops unsafe external URLs during normalization", () => {
    const settings = normalizeStoredSettings({
      ruleGroups: [
        {
          id: "work-focus",
          name: "工作时间专注",
          enabled: true,
          schedule: { enabled: true, startTime: "09:00", endTime: "18:00", days: [1, 2, 3, 4, 5] },
          sites: [],
          commitment: "先把重要的事做完。",
          blockPage: {
            title: "专注时间",
            description: "回到正事。",
            primaryActionLabel: "打开工作清单",
            primaryAction: {
              type: "external_url",
              externalUrl: "javascript:alert(1)",
              handoffTitle: "工作清单",
              handoffHtml: ""
            },
            tone: "focus",
            customHtmlEnabled: false,
            customHtml: ""
          },
          reminderMinutes: 15,
          blockMode: "standard",
          unlockMinutes: 10,
          maxUnlocksPerSession: 3,
          recordUnlockReason: true,
          createdAt: ""
        }
      ]
    });

    expect(settings.ruleGroups[0].blockPage.primaryAction).toMatchObject({
      type: "external_url",
      externalUrl: ""
    });
  });
});
