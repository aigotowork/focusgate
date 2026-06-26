# Options Guidelines

Options is the main configuration workspace for FocusGate / 守界. It owns rule-group creation, schedules, restricted sites, commitments, reminders, block-page presentation, primary actions, unlock limits, stats, and local data controls.

- Keep user-facing copy Chinese and rule-group first. Do not describe the whole product as a sleep tool.
- Use `FocusGate / 守界` for global chrome. Keep “晚安边界” only as the default sleep rule group.
- Preserve the settings-workbench density. Do not turn Options into a marketing page; branded education belongs in `welcome.html`.
- Store advanced HTML only through the existing block-page and handoff helpers. Do not render stored HTML directly in React.
- When changing settings behavior, update shared tests or Playwright coverage in the same change.
