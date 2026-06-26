# Architecture Notes

## Product Shape

GoodNight Guard is a Manifest V3 browser extension for Chrome and Edge. The MVP now uses rule groups: users can define separate blocking contexts such as bedtime boundaries and work-time focus, each with its own schedule, sites, commitment, reminder, and unlock policy.

## Runtime Strategy

The implementation uses `chrome.webNavigation.onBeforeNavigate` plus `chrome.tabs.update` instead of legacy blocking `webRequest`. The service worker initializes defaults, opens onboarding when needed, evaluates top-frame navigation across all enabled rule groups, records domain-level events with rule group attribution, redirects to `block.html`, sends reminder notifications, and periodically removes expired unlock sessions.

Future stricter blocking can add `declarativeNetRequest` rules once the rule model stabilizes. Do not rely on MV3 service worker memory staying alive; use `chrome.alarms` for reminder and cleanup work.

## Permissions

- `storage`: persist settings, unlock sessions, and domain-level events locally.
- `tabs`: read/update active tabs and redirect blocked navigation.
- `activeTab`: inspect the current page from the popup.
- `webNavigation`: observe top-frame navigation for blocking decisions.
- `alarms`: schedule reminder checks and expired-unlock cleanup.
- `notifications`: show the one-per-session bedtime reminder.
- `<all_urls>` host access: evaluate user-defined restricted domains across sites.

Keep permissions minimal. Do not record page titles, full history, or page content.

## Data Model

`src/shared/types.ts` defines the canonical model:

- `SleepSchedule`: enabled state, start/end times, and active weekdays.
- `SiteRule`: normalized host rules such as `youtube.com`.
- `RuleGroup`: complete blocking configuration for a context such as `晚安边界` or `工作时间专注`.
- `UnlockSession`: temporary per-host bypass with rule group id, timestamps, reason, mode, duration, and session id.
- `GuardEvent`: local domain-level events for stats, reminders, pauses, unlock reasons, and rule group attribution.
- `StatsSummary`: derived counts for today, tonight, seven-day history, top blocked hosts, and latest block time.

Storage is local-first through `src/shared/storage.ts`, with a `localStorage` fallback for Vite UI development. Legacy single-rule settings are migrated into the default `晚安边界` rule group.

## Rule Resolution

If multiple rule groups match the same host at the same time, the strictest group wins: `strict > standard > gentle`. Unlock sessions are scoped to one rule group and host, so unlocking a site in one group does not bypass another matching group.

## Module Boundaries

- `src/shared/`: pure rules and storage helpers. Keep rule group resolution, schedule, domain, unlock, migration, and stats logic testable here.
- `src/background/`: MV3 runtime wiring only.
- `src/popup/`, `src/options/`, `src/block/`: independent React entry points.
- `tests/`: deterministic tests for the shared rule layer.

## Verification

Run these before handing off changes:

```bash
npm run typecheck
npm test
npm run test:e2e
npm run build
```

For UI work, also run `npm run dev` and inspect `popup.html`, `options.html`, and `block.html` on `127.0.0.1:5179`.
