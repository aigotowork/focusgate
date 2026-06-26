# Shared Module Guidelines

Keep this directory browser-agnostic whenever possible. Rule group resolution, domain matching, schedule evaluation, reminder windows, unlock limits, session ids, block-page defaults, storage migration, default settings, and stats models belong here so they can be tested with Vitest.

Do not use string `includes` for host checks. Normalize hosts and match exact domains or subdomains only, for example `m.youtube.com` matches `youtube.com`, but `youtube.com.fake.test` does not.

When changing schedule or rule behavior, add or update tests in `tests/` before relying on UI verification. Rule group overlaps must keep strictness precedence deterministic.

Block-page customization is part of the rule-group model. Keep default templates, primary-action normalization, external URL validation, custom HTML size limits, and interpolation in `block-page.ts`. Do not render stored HTML directly in React; custom block and handoff pages must stay static and sandboxed by their entry points.

Brand constants live in `brand.ts`, and React brand chrome lives in `brand-ui.tsx`. Use these instead of hardcoding `FocusGate`, `守界`, slogans, or legacy names in runtime UI.
