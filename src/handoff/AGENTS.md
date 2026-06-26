# Handoff Page Guidelines

This entry point renders the optional follow-up page opened by a rule group's block-page primary action. It is not an unlock path and must never grant access to the blocked target.

Use Chinese for user-facing copy. Keep the page calm, light-first, and task-oriented so it can support sleep wind-down, work todo lists, or other post-block workflows without adding stimulation.

Custom handoff HTML belongs to `RuleGroup.blockPage.primaryAction.handoffHtml`. Render it only through an iframe with an empty `sandbox` attribute and `buildSandboxedCustomHtml` from `src/shared/block-page.ts`. Do not use `dangerouslySetInnerHTML`, do not expose extension APIs, and do not move unlock controls into this page.

If the handoff route, template variables, or sandbox policy changes, update shared block-page tests, Playwright entrypoint tests, and `project-docs/architecture.md`.
