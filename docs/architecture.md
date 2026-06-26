# Architecture Notes

## Product Shape

GoodNight Guard is a Manifest V3 browser extension for Chrome and Edge. The MVP focuses on local bedtime enforcement: users define a sleep schedule and a list of distracting domains, then the extension redirects restricted navigation to a calm block page during the active sleep window.

## Runtime Strategy

The first implementation uses `chrome.webNavigation.onBeforeNavigate` plus `chrome.tabs.update` instead of legacy blocking `webRequest`. This keeps the runtime simple for MVP validation and avoids long-lived service worker assumptions. The service worker only initializes defaults, evaluates top-frame navigation, records a domain-level event, and redirects to `block.html`.

Future stricter blocking can add `declarativeNetRequest` rules once the rule model stabilizes. If reminder notifications are added, use `chrome.alarms`; do not rely on MV3 service worker memory staying alive.

## Permissions

- `storage`: persist settings, unlock sessions, and domain-level events locally.
- `tabs`: read/update active tabs and redirect blocked navigation.
- `activeTab`: inspect the current page from the popup.
- `webNavigation`: observe top-frame navigation for blocking decisions.
- `<all_urls>` host access: evaluate user-defined restricted domains across sites.

Keep permissions minimal. Do not record page titles, full history, or page content.

## Data Model

`src/shared/types.ts` defines the canonical model:

- `SleepSchedule`: enabled state, start/end times, and active weekdays.
- `SiteRule`: normalized host rules such as `youtube.com`.
- `UnlockSession`: temporary per-host bypass with an expiration timestamp.
- `GuardEvent`: local domain-level events for basic stats.

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
npm run build
```

For UI work, also run `npm run dev` and inspect `popup.html`, `options.html`, and `block.html` on `127.0.0.1:5179`.
