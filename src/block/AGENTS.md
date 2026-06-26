# Block Page Guidelines

The block page is the strongest product boundary. It must show the rule group that caused the block, and use that group's commitment and unlock limits. Keep the primary action clear and calming: closing the page should be visually dominant, while temporary unlock remains intentionally slower.

Use Chinese for user-facing copy. Follow `DESIGN.md`: light-first surfaces, low stimulation, no shaming, and explicit friction for unlock actions.

Rule groups own their display copy, tone, and primary action through `RuleGroup.blockPage`. Do not hardcode sleep-only copy unless it is scoped to the default sleep template. Custom HTML must render only inside an iframe with an empty `sandbox` attribute; unlock controls, countdowns, reason capture, primary-action routing, and target redirects must remain outside the iframe and controlled by React.

Primary actions may close the block page, navigate to a safe external `http(s)` URL, or open `handoff.html` for static follow-up content. They must not bypass unlock limits or mutate unlock state.

If unlock behavior changes, update shared tests for `UnlockSession`, rule-group scoping, limits, and event recording, then verify `block.html` with Playwright or the dev server.
