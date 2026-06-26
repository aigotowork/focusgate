# Public Site Guidance

This directory contains the static public pages used for Chrome Web Store homepage, support URL, and privacy policy URL.

- Keep this site dependency-free and static so it can be hosted by Cloudflare Pages, GitHub Pages, Netlify, or any plain file server.
- Keep user-facing copy in Chinese unless a localized non-Chinese listing is created.
- Keep privacy claims aligned with `project-docs/store/privacy-policy-draft.md`, `prd.md`, and `project-docs/architecture.md`.
- Do not add analytics, tracking pixels, remote scripts, or third-party widgets unless the privacy policy and Chrome Web Store declarations are updated first.
- If extension data handling changes, update `privacy/index.html`, `project-docs/store/privacy-policy-draft.md`, and `project-docs/store/permission-justification-draft.md` together.
