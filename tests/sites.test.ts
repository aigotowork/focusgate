import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/shared/defaults";
import { evaluateAccess, evaluateUnlockLimit, extractHostnameFromUrl, matchesSiteRule } from "../src/shared/sites";
import type { RuleGroup } from "../src/shared/types";

function localDate(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute);
}

function workGroup(overrides: Partial<RuleGroup> = {}): RuleGroup {
  return {
    ...DEFAULT_SETTINGS.ruleGroups[0],
    id: "work-focus",
    name: "工作时间专注",
    schedule: {
      enabled: true,
      startTime: "09:00",
      endTime: "18:00",
      days: [1, 2, 3, 4, 5]
    },
    sites: [{ id: "bilibili", host: "bilibili.com", createdAt: "" }],
    commitment: "先完成今天最重要的工作。",
    ...overrides
  };
}

describe("site rules", () => {
  it("normalizes URL hosts", () => {
    expect(extractHostnameFromUrl("https://www.youtube.com/watch?v=1")).toBe("youtube.com");
  });

  it("matches subdomains against a parent host rule", () => {
    expect(matchesSiteRule("m.youtube.com", { id: "1", host: "youtube.com", createdAt: "" })).toBe(true);
  });

  it("does not match deceptive suffix domains", () => {
    expect(matchesSiteRule("youtube.com.fake.test", { id: "1", host: "youtube.com", createdAt: "" })).toBe(false);
  });

  it("blocks listed sites during bedtime", () => {
    const decision = evaluateAccess("https://youtube.com", DEFAULT_SETTINGS, localDate(2026, 6, 22, 23, 30));
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("blocked");
    expect(decision.sessionId).toBe("2026-06-22");
    expect(decision.ruleGroupName).toBe("晚安边界");
  });

  it("allows unlisted sites during bedtime", () => {
    const decision = evaluateAccess("https://example.com", DEFAULT_SETTINGS, localDate(2026, 6, 22, 23, 30));
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("not_listed");
  });

  it("allows temporarily unlocked hosts until expiry", () => {
    const decision = evaluateAccess(
      "https://youtube.com",
      {
        ...DEFAULT_SETTINGS,
        unlocks: [
          {
            ruleGroupId: "goodnight-boundary",
            host: "youtube.com",
            unlockedAt: localDate(2026, 6, 23, 0, 0).toISOString(),
            expiresAt: localDate(2026, 6, 23, 0, 30).toISOString(),
            durationMinutes: 30,
            mode: "standard",
            sessionId: "2026-06-22"
          }
        ]
      },
      localDate(2026, 6, 23, 0, 0)
    );
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("unlocked");
  });

  it("blocks again after a temporary unlock expires", () => {
    const decision = evaluateAccess(
      "https://youtube.com",
      {
        ...DEFAULT_SETTINGS,
        unlocks: [
          {
            ruleGroupId: "goodnight-boundary",
            host: "youtube.com",
            unlockedAt: localDate(2026, 6, 22, 23, 49).toISOString(),
            expiresAt: localDate(2026, 6, 22, 23, 59).toISOString(),
            durationMinutes: 10,
            mode: "standard",
            sessionId: "2026-06-22"
          }
        ]
      },
      localDate(2026, 6, 23, 0, 0)
    );
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("blocked");
  });

  it("does not block extension pages", () => {
    const decision = evaluateAccess("chrome-extension://abc/block.html?site=youtube.com", DEFAULT_SETTINGS);
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("extension_page");
  });

  it("enforces the nightly unlock limit", () => {
    const group = DEFAULT_SETTINGS.ruleGroups[0];
    const decision = evaluateUnlockLimit(
      group,
      [
        {
          id: "1",
          type: "unlocked",
          host: "youtube.com",
          createdAt: localDate(2026, 6, 22, 23, 10).toISOString(),
          sessionId: "2026-06-22",
          ruleGroupId: group.id
        },
        {
          id: "2",
          type: "unlocked",
          host: "reddit.com",
          createdAt: localDate(2026, 6, 22, 23, 20).toISOString(),
          sessionId: "2026-06-22",
          ruleGroupId: group.id
        },
        {
          id: "3",
          type: "unlocked",
          host: "bilibili.com",
          createdAt: localDate(2026, 6, 22, 23, 30).toISOString(),
          sessionId: "2026-06-22",
          ruleGroupId: group.id
        }
      ],
      localDate(2026, 6, 23, 0, 0)
    );

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("limit_reached");
  });

  it("blocks a custom work-time group outside the bedtime rule", () => {
    const decision = evaluateAccess(
      "https://bilibili.com/video",
      { ...DEFAULT_SETTINGS, ruleGroups: [workGroup()] },
      localDate(2026, 6, 22, 10, 0)
    );

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("blocked");
    expect(decision.ruleGroupName).toBe("工作时间专注");
  });

  it("chooses the stricter group when multiple groups match", () => {
    const gentle = workGroup({ id: "gentle", name: "温和规则", blockMode: "gentle" });
    const strict = workGroup({ id: "strict", name: "严格规则", blockMode: "strict" });
    const decision = evaluateAccess(
      "https://bilibili.com/video",
      { ...DEFAULT_SETTINGS, ruleGroups: [gentle, strict] },
      localDate(2026, 6, 22, 10, 0)
    );

    expect(decision.allowed).toBe(false);
    expect(decision.ruleGroupId).toBe("strict");
  });

  it("does not share unlocks across rule groups", () => {
    const decision = evaluateAccess(
      "https://bilibili.com/video",
      {
        ...DEFAULT_SETTINGS,
        ruleGroups: [workGroup({ id: "work-a" }), workGroup({ id: "work-b", blockMode: "strict" })],
        unlocks: [
          {
            ruleGroupId: "work-a",
            host: "bilibili.com",
            unlockedAt: localDate(2026, 6, 22, 10, 0).toISOString(),
            expiresAt: localDate(2026, 6, 22, 10, 30).toISOString(),
            durationMinutes: 30,
            mode: "standard",
            sessionId: "2026-06-22"
          }
        ]
      },
      localDate(2026, 6, 22, 10, 10)
    );

    expect(decision.allowed).toBe(false);
    expect(decision.ruleGroupId).toBe("work-b");
  });
});
