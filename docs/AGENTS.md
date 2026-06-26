# Public Site Guidance

This directory contains the static public pages used for Chrome Web Store homepage, support URL, and privacy policy URL.

- Keep the core public pages dependency-free and static so they can be hosted by Cloudflare Pages, GitHub Pages, Netlify, or any plain file server.
- Blog content uses GitHub Pages' built-in Jekyll processing and the configured theme in `_config.yml`. Do not hand-code blog page styling or add a custom frontend bundle for articles.
- Chinese is the default public version and lives at the root paths: `/`, `/support/`, and `/privacy/`.
- English and French localized versions live under `/en/` and `/fr/` with matching route names. Keep every localized route mutually linked through the visible language switcher and `hreflang` tags.
- `language.js` uses the standard browser `navigator.languages` / `navigator.language` values, plus a local `localStorage` language preference set by the switcher. Do not use Chrome extension APIs here; these pages run as a public website, not in an extension context.
- Automatic language routing should only run on the default Chinese pages. Explicit localized URLs such as `/en/privacy/` and `/fr/privacy/` must remain stable and should not redirect away from the user-selected language.
- Keep user-facing copy in Chinese unless editing a localized non-Chinese page.
- Keep privacy claims aligned with `project-docs/store/privacy-policy-draft.md`, `prd.md`, and `project-docs/architecture.md`.
- Do not add analytics, tracking pixels, remote scripts, or third-party widgets unless the privacy policy and Chrome Web Store declarations are updated first.
- If extension data handling changes, update `privacy/index.html`, `project-docs/store/privacy-policy-draft.md`, and `project-docs/store/permission-justification-draft.md` together.

## Blog Guidance

- Put article posts in `_posts/` and use Jekyll front matter with `layout: post`, `lang`, `description`, and a stable `permalink`.
- Keep the default Chinese blog index at `/blog/`. Keep the English blog index at `/blog/en/`. French blog content is not yet maintained.
- When publishing a planned bilingual article, create both `.zh.md` and `.en.md` posts with the same `translation_key`.
- Every post needs card metadata in front matter: `image`, `topic`, and `reading_time`. The image must resolve under `assets/blog/` and work as a blog index card thumbnail.
- Record planned article work in `blog/roadmap.md` before or while drafting posts. Each planned item should explain the target reader, user pain, article promise, image direction, and status.
- Store blog illustrations or article-specific icons in `assets/blog/`. Prefer light, calm SVG illustrations or real extension screenshots. Keep imagery aligned with `DESIGN.md` and avoid high-stimulation visuals.
- Blog posts are user-facing content. Chinese should be vivid, concrete, and empathetic; English should be clear, direct, and product-oriented.
- Place images with editorial rhythm. Do not put two image blocks next to each other, and avoid using images as decoration unless the image directly clarifies the preceding or following paragraph.
- Before publishing, review each article from top to bottom as a reader: every image should have a clear reason to appear at that exact point, and each section should contain enough prose between images for the article to breathe.
