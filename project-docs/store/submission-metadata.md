# Chrome Web Store Submission Metadata

Last reviewed: 2026-06-26

Use this file for final, non-secret submission choices. Do not store account credentials, payment details, or private support inbox credentials here.

## Current Recommendation

| Field | Recommended value | Status |
| --- | --- | --- |
| Chrome Web Store item ID | `hgjbamghlljcjckbcibjgknaidedaibi` | Draft created |
| Listing name | `守界 - FocusGate` | Final |
| Manifest name | `守界 - FocusGate` | Current value in `public/manifest.json` |
| Short name | `守界` | Current value in `public/manifest.json` |
| Primary locale | `zh-CN` | Recommended for first launch |
| Category | `Productivity` | Recommended |
| Pricing | `Free` | Recommended for MVP validation |
| Visibility | `Trusted testers` for final smoke test, then `Public` | Final launch path |
| Regions | All available regions | Final |

## Publisher Fields

| Field | Value |
| --- | --- |
| Publisher name | `aigotowork` |
| Support email | `long@aigotowork.work` |
| Support URL | `https://aigotowork.github.io/focusgate/support/` |
| Project or homepage URL | `https://aigotowork.github.io/focusgate/` |
| Hosted privacy policy URL | `https://aigotowork.github.io/focusgate/privacy/` |

## Naming Decision Notes

The product source of truth is `FocusGate / 守界` in `prd.md` and `DESIGN.md`. The current manifest uses:

```json
"name": "守界 - FocusGate",
"short_name": "守界"
```

The first Chinese store listing uses `守界 - FocusGate` to make the Chinese brand and English product identity visible in search results. Keep `prd.md`, `DESIGN.md`, manifest, listing copy, screenshots, and privacy policy aligned.

## Store Listing Values

Summary:

```text
用规则组为睡眠、工作和戒断场景建立可执行的网站边界。
```

Detailed description:

Use `project-docs/store/store-listing-draft.md`.

Reviewer notes:

Use the `Reviewer Notes` section in `project-docs/store/store-listing-draft.md` and the test instructions in `project-docs/store/publishing-checklist.md`.

## Privacy Values

Single purpose:

```text
FocusGate / 守界 lets users create local rule groups that limit access to user-selected websites during scheduled focus, sleep, study, or digital-withdrawal windows.
```

Privacy policy:

Use `https://aigotowork.github.io/focusgate/privacy/`. Source content lives in `docs/privacy/index.html`; internal draft copy lives in `project-docs/store/privacy-policy-draft.md`.

Permission and data-use justification:

Use `project-docs/store/permission-justification-draft.md`.

## Launch Decision Log

Record final decisions here as dated notes. Prefer links to source-of-truth issues, PRs, or dashboard screenshots instead of duplicating long rationale.

- 2026-06-26: Initial launch metadata file created.
- 2026-06-26: Chrome Web Store draft item ID recorded as `hgjbamghlljcjckbcibjgknaidedaibi`.
- 2026-06-26: Publisher metadata, GitHub Pages URLs, all-region distribution, and `Trusted testers` first-launch path finalized.
