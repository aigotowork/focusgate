import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../src/shared/defaults";
import { evaluateAccess, extractHostnameFromUrl, matchesSiteRule } from "../src/shared/sites";

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
        unlocks: [{ host: "youtube.com", expiresAt: localDate(2026, 6, 23, 0, 30).toISOString() }]
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
        unlocks: [{ host: "youtube.com", expiresAt: localDate(2026, 6, 22, 23, 59).toISOString() }]
      },
      localDate(2026, 6, 23, 0, 0)
    );
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("blocked");
  });
});
