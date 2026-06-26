# I18n Shared Module Guidelines

Runtime UI copy for FocusGate / 守界 lives here. Read `project-docs/i18n.md` before changing locale behavior, catalog shape, default copy, or import/export copy.

## Module Boundaries

- Use `SupportedLocale` values such as `zh-CN` and `en` in TypeScript runtime code.
- Chrome manifest locale folders use Chrome naming, for example `public/_locales/zh_CN`; keep that layer separate from runtime catalogs.
- Keep public website localization under `docs/`; the static site has separate routing, switcher, and `hreflang` rules.
- Keep language resolution pure in `resolve-locale.ts`; environment-specific sources such as `navigator.languages` or `chrome.i18n` should only feed inputs into it.
- Use `runtime.ts` for non-React environment adapters and `react.tsx` for React context.

## Catalog Workflows

- Add new user-visible runtime copy to `types.ts` first, then update every catalog in `catalogs/`.
- Prefer semantic keys grouped by product surface or domain. Do not add generic fragments that only make sense when concatenated.
- Prefer formatter helpers or catalog functions for variable text, especially when word order can differ by language.
- Keep popup status semantics in shared rule code and localize labels/details through `popup-status.ts`.
- When adding Chrome metadata copy, update `public/manifest.json` and every `public/_locales/*/messages.json` file together.

## User Content Boundary

Rule group names, commitments, block page titles, primary button labels, custom block HTML, and handoff HTML are user content after they are saved. Language switching must not translate or overwrite them.

Locale-specific defaults are only for new installs, new rule groups, and missing fallback values during normalization or import. If the product needs to refresh existing saved copy into another language, make it an explicit user action.

## Verification

- Run `npm run typecheck` after catalog shape changes.
- Update `tests/i18n.test.ts` for resolver, formatter, default-copy, and popup-status behavior.
- Update `tests/settings.test.ts` when storage migration or normalization touches language/default boundaries.
- Update `tests/settings-transfer.test.ts` when export/import behavior or schema validation changes.
- Update Playwright coverage when visible localized flows change in Options, Popup, Block, Handoff, Welcome, or the content reminder.
