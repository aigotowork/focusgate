# Content Script Guidelines

Content scripts run inside arbitrary user pages. Keep them isolated, quiet, and minimal.

- Use shared rule evaluation from `src/shared/` instead of duplicating schedule or host matching logic.
- Render UI inside Shadow DOM and prefix storage/session keys with `goodnightGuard` to avoid page collisions.
- Do not read page titles, body text, form values, or page content. The content script only needs `window.location.href` and local extension settings.
- Do not grant unlocks, mutate rules, or record browsing events from this surface. Blocking and unlock decisions stay in background/block page code.
- User-facing copy must be Chinese, calm, and low-stimulation. The reminder is a quiet countdown, not a modal interruption.
