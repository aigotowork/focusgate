# Background Module Guidelines

This directory contains Manifest V3 service worker wiring. Keep it thin: initialize defaults, observe browser events, call `src/shared/` decision logic, and perform redirects.

Do not depend on long-lived in-memory state. Persist state through storage, and use `chrome.alarms` for future reminders or expiration work.

Before changing permissions or runtime strategy, update `public/manifest.json` and `docs/architecture.md` together.
