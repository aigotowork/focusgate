import { describe, expect, it } from "vitest";
import {
  buildSandboxedCustomHtml,
  canRenderCustomHtml,
  canRenderHandoffHtml,
  DEFAULT_FOCUS_BLOCK_PAGE,
  DEFAULT_SLEEP_BLOCK_PAGE,
  getDefaultBlockPageForRuleGroup,
  getExecutableExternalUrl,
  interpolateBlockPageHtml,
  MAX_CUSTOM_HTML_BYTES,
  normalizeBlockPageConfig,
  normalizePrimaryActionConfig
} from "../src/shared/block-page";

const context = {
  groupName: "工作时间专注",
  site: "bilibili.com",
  commitment: "先完成 <重要工作>",
  unlockMinutes: 10,
  time: "09:30"
};

describe("block page templates", () => {
  it("escapes interpolated values in custom HTML", () => {
    const html = interpolateBlockPageHtml("<p>{{commitment}}</p><p>{{ site }}</p>", context);

    expect(html).toContain("先完成 &lt;重要工作&gt;");
    expect(html).toContain("bilibili.com");
  });

  it("wraps custom HTML with a restrictive CSP", () => {
    const html = buildSandboxedCustomHtml("<main>{{groupName}}</main><script>window.evil = true</script>", context);

    expect(html).toContain("Content-Security-Policy");
    expect(html).toContain("default-src 'none'");
    expect(html).toContain("工作时间专注");
  });

  it("renders custom HTML only when it is enabled and within the size limit", () => {
    expect(
      canRenderCustomHtml({
        ...DEFAULT_FOCUS_BLOCK_PAGE,
        customHtmlEnabled: true,
        customHtml: "<main>Focus</main>"
      })
    ).toBe(true);

    const normalized = normalizeBlockPageConfig(
      {
        ...DEFAULT_FOCUS_BLOCK_PAGE,
        customHtmlEnabled: true,
        customHtml: "x".repeat(MAX_CUSTOM_HTML_BYTES + 1)
      },
      DEFAULT_FOCUS_BLOCK_PAGE
    );

    expect(canRenderCustomHtml(normalized)).toBe(false);
  });

  it("defaults primary actions to closing the block page", () => {
    expect(DEFAULT_SLEEP_BLOCK_PAGE.primaryAction.type).toBe("close");
    expect(DEFAULT_FOCUS_BLOCK_PAGE.primaryAction.type).toBe("close");
    expect(getDefaultBlockPageForRuleGroup({ id: "work", name: "工作时间专注" }).primaryAction).toMatchObject({
      type: "close",
      externalUrl: ""
    });
  });

  it("deep-clones default primary actions across block page configs", () => {
    const first = getDefaultBlockPageForRuleGroup({ id: "work-a", name: "工作时间专注 A" });
    const second = getDefaultBlockPageForRuleGroup({ id: "work-b", name: "工作时间专注 B" });

    first.primaryAction.externalUrl = "https://example.com/todo";

    expect(second.primaryAction.externalUrl).toBe("");
    expect(DEFAULT_FOCUS_BLOCK_PAGE.primaryAction.externalUrl).toBe("");
  });

  it("keeps only executable http and https external URLs", () => {
    const httpsAction = normalizePrimaryActionConfig({
      type: "external_url",
      externalUrl: "https://example.com/todo"
    });
    const unsafeAction = normalizePrimaryActionConfig({
      type: "external_url",
      externalUrl: "javascript:alert(1)"
    });
    const malformedAction = normalizePrimaryActionConfig({
      type: "external_url",
      externalUrl: "https://"
    });

    expect(getExecutableExternalUrl(httpsAction)).toBe("https://example.com/todo");
    expect(unsafeAction.externalUrl).toBe("");
    expect(getExecutableExternalUrl(unsafeAction)).toBeUndefined();
    expect(getExecutableExternalUrl(malformedAction)).toBeUndefined();
  });

  it("normalizes handoff HTML with the same size boundary as custom block HTML", () => {
    const action = normalizePrimaryActionConfig({
      type: "handoff_html",
      handoffTitle: "工作清单",
      handoffHtml: "<main>{{groupName}}</main>"
    });
    const oversizedAction = normalizePrimaryActionConfig({
      type: "handoff_html",
      handoffHtml: "x".repeat(MAX_CUSTOM_HTML_BYTES + 1)
    });

    expect(canRenderHandoffHtml(action)).toBe(true);
    expect(canRenderHandoffHtml(oversizedAction)).toBe(false);
    expect(oversizedAction.handoffHtml).toBe("");
  });
});
