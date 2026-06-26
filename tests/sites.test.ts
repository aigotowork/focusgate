import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/shared/defaults";
import { evaluateAccess, evaluateUnlockLimit, extractHostnameFromUrl, matchesSiteRule } from "../src/shared/sites";

function localDate(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute);
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
    const decision = evaluateUnlockLimit(
      DEFAULT_SETTINGS,
      [
        {
          id: "1",
          type: "unlocked",
          host: "youtube.com",
          createdAt: localDate(2026, 6, 22, 23, 10).toISOString(),
          sessionId: "2026-06-22"
        },
        {
          id: "2",
          type: "unlocked",
          host: "reddit.com",
          createdAt: localDate(2026, 6, 22, 23, 20).toISOString(),
          sessionId: "2026-06-22"
        },
        {
          id: "3",
          type: "unlocked",
          host: "bilibili.com",
          createdAt: localDate(2026, 6, 22, 23, 30).toISOString(),
          sessionId: "2026-06-22"
        }
      ],
      localDate(2026, 6, 23, 0, 0)
    );

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("limit_reached");
  });
});
