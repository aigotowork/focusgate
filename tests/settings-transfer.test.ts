import { describe, expect, it } from "vitest";
import { createDefaultSettings } from "../src/shared/defaults";
import {
  buildSettingsExport,
  mergeImportedSettings,
  parseSettingsImport,
  SettingsTransferError,
  stringifySettingsExport,
  summarizeSettingsImport
} from "../src/shared/settings-transfer";
import type { AppSettings, RuleGroup } from "../src/shared/types";

describe("settings transfer", () => {
  it("exports only selected rule groups and omits transient state", () => {
    const exported = buildSettingsExport(appSettings([group("sleep"), group("work")]), ["work"], new Date("2026-06-27T10:00:00Z"));

    expect(exported).toMatchObject({
      schema: "focusgate.settings.export",
      version: 1,
      exportedAt: "2026-06-27T10:00:00.000Z",
      appVersion: "0.1.0"
    });
    expect(exported.settings.ruleGroups.map((item) => item.id)).toEqual(["work"]);
    expect(exported.settings.onboardingCompleted).toBe(true);
    expect("unlocks" in exported.settings).toBe(false);
    expect("remindedSessionIds" in exported.settings).toBe(false);
    expect("pauseUntil" in exported.settings).toBe(false);
  });

  it("throws when exporting no rule groups", () => {
    expect(() => buildSettingsExport(appSettings([group("sleep")]), [])).toThrow(SettingsTransferError);
  });

  it("merges imports by replacing matching IDs and preserving unrelated local groups", () => {
    const current = appSettings([group("sleep", "Local sleep"), group("work", "Local work")]);
    const imported = buildSettingsExport(appSettings([group("work", "Imported work"), group("reset", "Imported reset")]), ["work", "reset"]);
    const merged = mergeImportedSettings(current, imported, "merge");

    expect(merged.ruleGroups.map((item) => `${item.id}:${item.name}`)).toEqual([
      "sleep:Local sleep",
      "work:Imported work",
      "reset:Imported reset"
    ]);
    expect(merged.unlocks).toEqual([]);
    expect(merged.remindedSessionIds).toEqual([]);
    expect(merged.pauseUntil).toBeUndefined();
  });

  it("replaces current transferable settings in replace mode", () => {
    const current = appSettings([group("sleep"), group("work")]);
    const imported = buildSettingsExport(appSettings([group("reset", "Imported reset")]), ["reset"]);
    const replaced = mergeImportedSettings(current, imported, "replace");

    expect(replaced.ruleGroups.map((item) => item.id)).toEqual(["reset"]);
    expect(replaced.ruleGroups[0].name).toBe("Imported reset");
    expect(replaced.unlocks).toEqual([]);
    expect(replaced.remindedSessionIds).toEqual([]);
  });

  it("summarizes imported groups against the current settings", () => {
    const current = appSettings([group("sleep"), group("work")]);
    const imported = buildSettingsExport(appSettings([group("work"), group("reset")]), ["work", "reset"]);

    expect(summarizeSettingsImport(current, imported)).toEqual({
      ruleGroupCount: 2,
      addedRuleGroupCount: 1,
      replacedRuleGroupCount: 1,
      removedRuleGroupCount: 1
    });
  });

  it("parses exported files and normalizes missing group fields", () => {
    const parsed = parseSettingsImport(
      JSON.stringify({
        schema: "focusgate.settings.export",
        version: 1,
        exportedAt: "2026-06-27T10:00:00.000Z",
        appVersion: "0.1.0",
        settings: {
          ruleGroups: [
            {
              id: "work-focus",
              name: "工作时间专注",
              enabled: true,
              schedule: { enabled: true, startTime: "09:00", endTime: "18:00", days: [1, 2, 3, 4, 5] },
              sites: [],
              commitment: "先做重要的事。",
              reminderMinutes: 15,
              blockMode: "standard",
              unlockMinutes: 10,
              maxUnlocksPerSession: 3,
              recordUnlockReason: true,
              createdAt: ""
            }
          ],
          onboardingCompleted: true,
          language: { preference: "en" }
        }
      })
    );

    expect(parsed.settings.ruleGroups[0].blockPage).toMatchObject({
      title: "现在是限制时间",
      primaryAction: { type: "close" }
    });
    expect(parsed.settings.language.preference).toBe("en");
  });

  it("rejects schema-stamped imports with invalid rule-group runtime types", () => {
    expect(() =>
      parseSettingsImport(
        JSON.stringify({
          schema: "focusgate.settings.export",
          version: 1,
          settings: {
            ruleGroups: [
              {
                id: 123,
                name: 42,
                schedule: { enabled: true, startTime: "09:00", endTime: "18:00", days: [1] },
                sites: []
              }
            ],
            onboardingCompleted: true,
            language: { preference: "zh-CN" }
          }
        })
      )
    ).toThrow(SettingsTransferError);
  });

  it("round-trips exported JSON text", () => {
    const exported = buildSettingsExport(appSettings([group("sleep")]), ["sleep"]);
    const parsed = parseSettingsImport(stringifySettingsExport(exported));

    expect(parsed.settings.ruleGroups[0].id).toBe("sleep");
  });

  it("rejects invalid import files", () => {
    expect(() => parseSettingsImport("{")).toThrow(SettingsTransferError);
    expect(() => parseSettingsImport(JSON.stringify({ schema: "other", version: 1, settings: { ruleGroups: [group("x")] } }))).toThrow(
      SettingsTransferError
    );
    expect(() =>
      parseSettingsImport(
        JSON.stringify({
          schema: "focusgate.settings.export",
          version: 999,
          settings: { ruleGroups: [group("x")] }
        })
      )
    ).toThrow(SettingsTransferError);
    expect(() =>
      parseSettingsImport(
        JSON.stringify({
          schema: "focusgate.settings.export",
          version: 1,
          settings: { ruleGroups: [] }
        })
      )
    ).toThrow(SettingsTransferError);
  });
});

function appSettings(ruleGroups: RuleGroup[]): AppSettings {
  return {
    ...createDefaultSettings("zh-CN"),
    ruleGroups,
    unlocks: [
      {
        ruleGroupId: ruleGroups[0]?.id ?? "missing",
        host: "example.com",
        unlockedAt: "2026-06-27T09:00:00.000Z",
        expiresAt: "2026-06-27T09:10:00.000Z",
        durationMinutes: 10,
        mode: "standard",
        sessionId: "session"
      }
    ],
    onboardingCompleted: true,
    remindedSessionIds: ["work:session"],
    pauseUntil: "2026-06-27T10:00:00.000Z"
  };
}

function group(id: string, name = id): RuleGroup {
  return {
    ...createDefaultSettings("zh-CN").ruleGroups[0],
    id,
    name,
    sites: [{ id: `${id}-site`, host: `${id}.example.com`, createdAt: "2026-06-27T00:00:00.000Z" }],
    createdAt: "2026-06-27T00:00:00.000Z"
  };
}
