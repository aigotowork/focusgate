# Public Site Guidance

This directory contains the static public pages used for Chrome Web Store homepage, support URL, and privacy policy URL.

- Keep this site dependency-free and static so it can be hosted by Cloudflare Pages, GitHub Pages, Netlify, or any plain file server.
- Chinese is the default public version and lives at the root paths: `/`, `/support/`, and `/privacy/`.
- English and French localized versions live under `/en/` and `/fr/` with matching route names. Keep every localized route mutually linked through the visible language switcher and `hreflang` tags.
- `language.js` uses the standard browser `navigator.languages` / `navigator.language` values, plus a local `localStorage` language preference set by the switcher. Do not use Chrome extension APIs here; these pages run as a public website, not in an extension context.
- Automatic language routing should only run on the default Chinese pages. Explicit localized URLs such as `/en/privacy/` and `/fr/privacy/` must remain stable and should not redirect away from the user-selected language.
- Keep user-facing copy in Chinese unless editing a localized non-Chinese page.
- Keep privacy claims aligned with `project-docs/store/privacy-policy-draft.md`, `prd.md`, and `project-docs/architecture.md`.
- Do not add analytics, tracking pixels, remote scripts, or third-party widgets unless the privacy policy and Chrome Web Store declarations are updated first.
- If extension data handling changes, update `privacy/index.html`, `project-docs/store/privacy-policy-draft.md`, and `project-docs/store/permission-justification-draft.md` together.
