# Background Module Guidelines

This directory contains Manifest V3 service worker wiring. Keep it thin: initialize defaults, open onboarding when needed, observe browser events, call `src/shared/` rule-group decision logic, send notifications, and perform redirects.

Do not depend on long-lived in-memory state. Persist state through storage, and use `chrome.alarms` for reminders and expiration cleanup.

Before changing permissions or runtime strategy, update `public/manifest.json` and `docs/architecture.md` together.
