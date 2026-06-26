# Shared Module Guidelines

Keep this directory browser-agnostic whenever possible. Rule group resolution, domain matching, schedule evaluation, reminder windows, unlock limits, session ids, storage migration, default settings, and stats models belong here so they can be tested with Vitest.

Do not use string `includes` for host checks. Normalize hosts and match exact domains or subdomains only, for example `m.youtube.com` matches `youtube.com`, but `youtube.com.fake.test` does not.

When changing schedule or rule behavior, add or update tests in `tests/` before relying on UI verification. Rule group overlaps must keep strictness precedence deterministic.
