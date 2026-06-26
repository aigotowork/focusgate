import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/shared/defaults";
import { buildStatsSummary } from "../src/shared/stats";
import type { GuardEvent } from "../src/shared/types";

function localDate(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute);
}

describe("stats summary", () => {
  it("aggregates today, tonight, seven-day, and top-host stats", () => {
    const events: GuardEvent[] = [
      {
        id: "1",
        type: "blocked",
        host: "youtube.com",
        createdAt: localDate(2026, 6, 22, 23, 10).toISOString(),
        sessionId: "2026-06-22"
      },
      {
        id: "2",
        type: "blocked",
        host: "youtube.com",
        createdAt: localDate(2026, 6, 23, 0, 10).toISOString(),
        sessionId: "2026-06-22"
      },
      {
        id: "3",
        type: "unlocked",
        host: "youtube.com",
        createdAt: localDate(2026, 6, 23, 0, 20).toISOString(),
        sessionId: "2026-06-22"
      }
    ];

    const summary = buildStatsSummary(events, DEFAULT_SETTINGS.schedule, localDate(2026, 6, 23, 0, 30));

    expect(summary.todayBlocked).toBe(1);
    expect(summary.todayUnlocked).toBe(1);
    expect(summary.tonightBlocked).toBe(2);
    expect(summary.tonightUnlocked).toBe(1);
    expect(summary.topBlockedHosts[0]).toEqual({ host: "youtube.com", count: 2 });
    expect(summary.lastSevenDays).toHaveLength(7);
  });
});
