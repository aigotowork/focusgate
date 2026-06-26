# Background Module Guidelines

This directory contains Manifest V3 service worker wiring. Keep it thin: initialize defaults, open onboarding when needed, observe browser events, call `src/shared/` rule-group decision logic, send notifications, and perform redirects.

Do not depend on long-lived in-memory state. Persist state through storage. Use exact one-shot `chrome.alarms` for the next reminder/block start, and avoid continuous high-frequency polling. It is acceptable to scan open HTTP(S) tabs once when the scheduled tick fires.

Before changing permissions or runtime strategy, update `public/manifest.json` and `project-docs/architecture.md` together.
