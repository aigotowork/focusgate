import { describe, expect, it } from "vitest";
import { createDefaultSettings } from "../src/shared/defaults";
import { formatCount, formatDuration, formatWeekday, getPopupStatusCopy, resolveLocale } from "../src/shared/i18n";
import { getDefaultBlockPageForRuleGroup } from "../src/shared/block-page";
import { getPopupPageContext } from "../src/shared/sites";

function localDate(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute);
}

describe("runtime i18n", () => {
  it("resolves explicit preferences before browser languages", () => {
    expect(resolveLocale({ preference: "en", browserLanguages: ["zh-CN"] })).toBe("en");
    expect(resolveLocale({ preference: "zh-CN", browserLanguages: ["en-US"] })).toBe("zh-CN");
  });

  it("matches browser language aliases and falls back to zh-CN", () => {
    expect(resolveLocale({ preference: "auto", browserLanguages: ["en-US"] })).toBe("en");
    expect(resolveLocale({ preference: "auto", browserLanguages: ["en-GB"] })).toBe("en");
    expect(resolveLocale({ preference: "auto", browserLanguages: ["zh-Hans-CN"] })).toBe("zh-CN");
    expect(resolveLocale({ preference: "auto", browserLanguages: ["fr-FR"] })).toBe("zh-CN");
  });

  it("creates locale-specific default settings without changing the runtime fallback", () => {
    const zh = createDefaultSettings("zh-CN");
    const en = createDefaultSettings("en");

    expect(zh.ruleGroups[0].name).toBe("晚安守护");
    expect(zh.ruleGroups[0].blockPage.title).toBe("现在是晚安时间");
    expect(en.ruleGroups[0].name).toBe("Goodnight Guard");
    expect(en.ruleGroups[0].commitment).toBe("My tomorrow morning self will thank me for stopping now.");
    expect(en.ruleGroups[0].blockPage.primaryActionLabel).toBe("Close this page");
    expect(en.language.preference).toBe("auto");
  });

  it("creates locale-specific default block pages", () => {
    expect(getDefaultBlockPageForRuleGroup({ id: "work", name: "Work Focus" }, "en")).toMatchObject({
      title: "This is protected time",
      primaryActionLabel: "Close and return to focus"
    });
    expect(getDefaultBlockPageForRuleGroup({ id: "goodnight", name: "Goodnight Guard" }, "en")).toMatchObject({
      title: "It is time to wind down",
      tone: "sleep"
    });
  });

  it("formats durations, counts, and weekdays per locale", () => {
    expect(formatDuration(15 * 60000, "zh-CN")).toBe("15 分钟");
    expect(formatDuration(2 * 60 * 60000, "zh-CN")).toBe("2 小时");
    expect(formatDuration(90 * 60000, "en")).toBe("1 hour 30 minutes");
    expect(formatCount(2, "en")).toBe("2 times");
    expect(formatWeekday(1, "en")).toBe("Mon");
  });

  it("localizes popup status copy from semantic page context", () => {
    const settings = createDefaultSettings("en");
    const context = getPopupPageContext(settings, "https://youtube.com", localDate(2026, 6, 22, 23, 30));

    expect(context.status).toBe("blocked");
    expect(context).not.toHaveProperty("statusLabel");
    expect(getPopupStatusCopy(context, "en")).toEqual({
      label: "This page will be blocked",
      detail: "Goodnight Guard is protecting this site."
    });
    expect(getPopupStatusCopy(context, "zh-CN").label).toBe("当前页面会被阻断");
  });
});
