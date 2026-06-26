# I18n Shared Module Guidelines

Runtime UI copy for FocusGate / 守界 lives here. Do not hardcode user-visible strings in React entry points, background notifications, or content scripts when a catalog key is appropriate.

- Use `SupportedLocale` values such as `zh-CN` and `en` in TypeScript runtime code.
- Chrome manifest locale folders use Chrome naming, for example `public/_locales/zh_CN`; keep that layer separate from runtime catalogs.
- Keep language resolution pure in `resolve-locale.ts`; environment-specific sources such as `navigator.languages` or `chrome.i18n` should only feed inputs into it.
- Rule group names, commitments, block page titles, primary button labels, custom block HTML, and handoff HTML are user content after they are saved. Language switching must not translate or overwrite them.
- Locale-specific defaults are only for new installs, new rule groups, and missing fallback values during normalization.
- Prefer semantic catalog keys and small formatter helpers over string concatenation in UI code, especially when word order can differ by language.
