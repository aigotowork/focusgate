# Block Page Guidelines

The block page is the strongest product boundary. Keep the primary action clear and calming: closing the page should be visually dominant, while temporary unlock remains intentionally slower.

Use Chinese for user-facing copy. Follow `DESIGN.md`: dark-first surfaces, low stimulation, no shaming, and explicit friction for unlock actions.

If unlock behavior changes, update shared tests for `UnlockSession`, nightly limits, and event recording, then verify `block.html` with Playwright or the dev server.
