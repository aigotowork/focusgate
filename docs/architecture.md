# Architecture Notes

## Product Shape

FocusGate / 守界 is a Manifest V3 browser extension for Chrome and Edge. The product is rule-group first: users can define separate blocking contexts such as bedtime boundaries, work-time focus, and digital-withdrawal rules, each with its own schedule, sites, commitment, reminder, unlock policy, block-page presentation, and handoff action. “晚安边界” remains the default sleep group rather than the product identity.

## Runtime Strategy

The implementation uses `chrome.webNavigation.onBeforeNavigate` plus `chrome.tabs.update` instead of legacy blocking `webRequest`. The service worker initializes defaults, opens `welcome.html` before onboarding when needed, evaluates top-frame navigation across all enabled rule groups, records domain-level events with rule group attribution, redirects to `block.html`, sends reminder notifications, and periodically removes expired unlock sessions.

Time-based work is scheduled with one exact `scheduleTick` alarm for the next reminder or block start across all rule groups. When it fires, the background checks reminders, scans currently open HTTP(S) tabs once, blocks tabs that became restricted while already open, and schedules the next exact tick. This avoids continuous per-minute polling for rule starts.

Page-level reminders are handled by `src/content/reminder-overlay.ts`. The content script runs on HTTP(S) pages, uses shared reminder eligibility logic, and renders a quiet Shadow DOM countdown only when the current host will soon be blocked. The detailed product and implementation design lives in `docs/reminder-experience.md`.

Future stricter blocking can add `declarativeNetRequest` rules once the rule model stabilizes. Do not rely on MV3 service worker memory staying alive; use `chrome.alarms` for reminder and cleanup work.

## Permissions

- `storage`: persist settings, unlock sessions, and domain-level events locally.
- `tabs`: read/update active tabs and redirect blocked navigation.
- `activeTab`: inspect the current page from the popup.
- `webNavigation`: observe top-frame navigation for blocking decisions.
- `alarms`: schedule the next exact reminder/block tick and low-frequency expired-unlock cleanup.
- `notifications`: show the one-per-session rule-group reminder.
- `<all_urls>` host access: evaluate user-defined restricted domains across sites.

Keep permissions minimal. Do not record page titles, full history, or page content.

## Data Model

`src/shared/types.ts` defines the canonical model:

- `SleepSchedule`: enabled state, start/end times, and active weekdays.
- `SiteRule`: normalized host rules such as `youtube.com`.
- `BlockPageConfig`: per-group title, description, primary action label, primary action, tone, and optional static custom HTML.
- `RuleGroup`: complete blocking configuration for a context such as `晚安边界` or `工作时间专注`.
- `UnlockSession`: temporary per-host bypass with rule group id, timestamps, reason, mode, duration, and session id.
- `GuardEvent`: local domain-level events for stats, reminders, pauses, unlock reasons, and rule group attribution.
- `ReminderWindowState` and `PageReminderDecision`: derived reminder timing and page-level reminder eligibility for the content script.
- `PopupPageContext`: derived current-page status for the popup, including matched rule group, selected add target, and global active/upcoming counts.
- `StatsSummary`: derived counts for today, tonight, seven-day history, top blocked hosts, and latest block time.

Storage is local-first through `src/shared/storage.ts`, with a `localStorage` fallback for Vite UI development. Legacy single-rule settings are migrated into the default `晚安边界` rule group, and existing rule groups are backfilled with a safe `blockPage` configuration whose primary action closes the block page.

Brand naming is centralized in `src/shared/brand.ts`. Historical storage keys still use the `goodnightGuard` prefix for compatibility; do not rename them without a migration plan.

## Block Page Customization

Built-in block pages use deterministic light-first templates from `src/shared/block-page.ts`. Sleep groups keep the default “晚安时间” presentation, while non-sleep groups default to a generic focus-oriented page. Options can edit title, description, primary action label, primary action, and tone per rule group. Visual rules live in `DESIGN.md`; archived UI sketches under `docs/archive/` are historical only.

Custom HTML is an advanced static-only mode. The block page renders it through an iframe `srcDoc` with an empty `sandbox` attribute and a restrictive inline CSP. Stored HTML is capped at 100KB, receives only escaped template variables such as `{{groupName}}` and `{{site}}`, and never gets extension APIs or unlock state. Unlock controls, countdown, reason capture, and redirects stay outside the iframe.

Primary actions define what the dominant block-page button does after a user accepts the boundary: close the page, navigate to a safe absolute `http(s)` URL, or open `handoff.html` with static follow-up content. External URLs are validated in shared code before execution. Handoff HTML uses the same 100KB limit, escaping, and empty-sandbox iframe policy as custom block HTML; it is for next-step content only and never changes unlock state.

## Rule Resolution

If multiple rule groups match the same host at the same time, the strictest group wins: `strict > standard > gentle`. Unlock sessions are scoped to one rule group and host, so unlocking a site in one group does not bypass another matching group.

## Module Boundaries

- `src/shared/`: pure rules and storage helpers. Keep rule group resolution, schedule, domain, unlock, migration, and stats logic testable here.
- `src/background/`: MV3 runtime wiring only.
- `src/content/`: page-level reminders only. Keep UI isolated with Shadow DOM and do not record page content or grant unlocks.
- `src/welcome/`: branded home surface and first-install entry point.
- `src/popup/`, `src/options/`, `src/block/`, `src/handoff/`: independent React entry points.
- `tests/`: deterministic tests for the shared rule layer.

## Verification

Run these before handing off changes:

```bash
npm run typecheck
npm test
npm run test:e2e
npm run build
```

For UI work, also run `npm run dev` and inspect `welcome.html`, `popup.html`, `options.html`, `block.html`, and `handoff.html` on `127.0.0.1:5179`.
