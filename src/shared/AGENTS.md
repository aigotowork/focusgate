# Shared Module Guidelines

Keep this directory browser-agnostic whenever possible. Domain matching, schedule evaluation, unlock expiry, default settings, and event/stat models belong here so they can be tested with Vitest.

Do not use string `includes` for host checks. Normalize hosts and match exact domains or subdomains only, for example `m.youtube.com` matches `youtube.com`, but `youtube.com.fake.test` does not.

When changing schedule or rule behavior, add or update tests in `tests/` before relying on UI verification.
