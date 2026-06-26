# Architecture Notes

## Product Shape

GoodNight Guard is a Manifest V3 browser extension for Chrome and Edge. The MVP focuses on local bedtime enforcement: users define a sleep schedule and a list of distracting domains, then the extension reminds before bedtime and redirects restricted navigation to a calm block page during the active sleep window.

## Runtime Strategy

The first implementation uses `chrome.webNavigation.onBeforeNavigate` plus `chrome.tabs.update` instead of legacy blocking `webRequest`. This keeps the runtime simple for MVP validation and avoids long-lived service worker assumptions. The service worker initializes defaults, opens onboarding when needed, evaluates top-frame navigation, records domain-level events, redirects to `block.html`, sends reminder notifications, and periodically removes expired unlock sessions.

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
- `UnlockSession`: temporary per-host bypass with timestamps, reason, mode, duration, and sleep session id.
- `GuardEvent`: local domain-level events for stats, reminders, pauses, and unlock reasons.
- `StatsSummary`: derived counts for today, tonight, seven-day history, top blocked hosts, and latest block time.

Storage is local-first through `src/shared/storage.ts`, with a `localStorage` fallback for Vite UI development.

## Module Boundaries

- `src/shared/`: pure rules and storage helpers. Keep schedule, domain, unlock, and stats logic testable here.
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
