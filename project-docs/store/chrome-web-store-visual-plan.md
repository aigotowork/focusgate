# FocusGate / 守界 Chrome Web Store Visual Resource Plan

Last reviewed: 2026-06-26

## Authoritative Requirements

Chrome Web Store listing visuals should follow Chrome for Developers image guidance: <https://developer.chrome.com/docs/webstore/images>.

| Asset | Required | Size | Format | FocusGate plan |
| --- | --- | --- | --- | --- |
| Screenshots | Yes, at least 1 | `1280x800` or `640x400` | JPG or 24-bit PNG | Produce 5 final `1280x800` PNG screenshots from the built extension UI. |
| Small promotional tile | Yes | `440x280` | JPG or 24-bit PNG | Produce one branded tile from `public/store/promo-tile-440x280.source.svg`. |
| Marquee promotional tile | Optional | `1400x560` | JPG or 24-bit PNG | Produce one wide branded tile from `public/store/marquee-1400x560.source.svg` for campaigns and future feature. |

Notes:

- Screenshots should show real UI and should not rely on placeholder mockups.
- Promotional tiles may be graphic treatments, but should still match the Gate Daylight UI system in `DESIGN.md`.
- Final exported upload files should avoid the `.source.svg` suffix. Use PNG unless there is a specific reason to export JPG.
- Generate promotional PNGs with `npm run store:assets`; the script removes source-template labels and checks final dimensions.

## Store Visual Positioning

Primary message: `该专注时，守住你的注意力边界。`

Supporting store copy:

- `为睡眠、工作和戒断场景建立可执行的网站边界。`
- `用规则组设置时间、站点、提醒、阻断页和临时解锁。`
- `设置保存在本地；边界清楚，打扰更少。`

Visual tone:

- Light-first, calm, and low-stimulation.
- Use real extension surfaces instead of abstract productivity scenes.
- Show rule groups as the product structure: `晚安守护`, `工作时间专注`, and `周末戒断`.
- Use the FocusGate gate-lock mark as the visual anchor. Do not switch to moon, shield, or generic wellness imagery as the brand mark.

## Final Screenshot Set

Capture final screenshots at `1280x800`. Use a clean browser profile or controlled extension storage so the UI is reproducible. Do not include personal domains, account names, browser bookmarks, or unrelated tabs.

### 1. Welcome / Product Promise

- Source UI: `welcome.html`
- Scene: first-install welcome page, desktop viewport.
- Goal: establish the product name, slogan, and three supported scenarios.
- Suggested visible copy:
  - `FocusGate / 守界`
  - `该专注时，守住你的注意力边界。`
  - Scenario cards: `睡前放下`, `工作专注`, `戒断节制`
- Composition: full page, with the right-side workflow panel visible.
- Status: requires real screenshot capture.

### 2. Options / Rule Group Setup

- Source UI: `options.html?onboarding=1`
- Scene: default `晚安守护` selected, showing schedule, weekdays, sites, and block strength.
- Goal: prove that FocusGate is configurable by rule group rather than a single hardcoded sleep blocker.
- Seed data:
  - Rule groups: `晚安守护`, `工作时间专注`, `周末戒断`
  - `晚安守护` schedule: `23:00-07:00`, every day
  - Sites: `youtube.com`, `bilibili.com`, `reddit.com`
  - Reminder: `提前 30 分钟`
  - Mode: `标准`
- Composition: crop/scroll so the left rule group list, rule basics, website rules, and strength selector are visible.
- Status: requires real screenshot capture.

### 3. Popup / Current Page Status

- Source UI: extension popup or `popup.html` with controlled active-tab context.
- Scene: current page is an entertainment domain that can be added to `晚安守护`, with today's stats visible.
- Goal: show the lightweight daily interaction: inspect current site, add it to a rule group, preview block page.
- Suggested domain: `bilibili.com`
- Desired state: `即将受限` or `未命中`, depending on reliable test setup.
- Composition: place popup over a quiet neutral browser background or capture the standalone popup at high scale and inset it into a `1280x800` frame.
- Status: requires real screenshot capture. Mocking active tab state may need a Playwright or Chrome extension fixture.

### 4. Block Page / Boundary Moment

- Source UI: `block.html?site=bilibili.com&group=<seeded晚安守护id>`
- Scene: blocking page for the default sleep rule group.
- Goal: show the core user-facing intervention: rule group name, blocked site, commitment, primary action, and quieter unlock path.
- Suggested visible copy:
  - `晚安守护`
  - `已拦截访问：bilibili.com`
  - `关闭页面` or configured primary action
  - `临时解锁 10 分钟`
- Composition: centered page, no browser UI, enough whitespace to communicate calm.
- Status: requires real screenshot capture.

### 5. Handoff Or Reminder / Recovery Path

Preferred scene:

- Source UI: `handoff.html?site=bilibili.com&group=<seeded晚安守护id>`
- Scene: configured handoff page with a short sleep close-down checklist rendered in the sandbox.
- Goal: show that the product does more than block; it gives the user a next step.
- Suggested handoff content:
  - `下一步：收束今晚`
  - `保存进度`
  - `放下屏幕`
  - `准备明天`

Fallback scene:

- Source UI: reminder overlay on a seeded webpage.
- Scene: reminder panel says a rule group will begin soon.
- Goal: show pre-blocking reminder behavior without high stimulation.

Status: requires real screenshot capture. Handoff requires seed data with `primaryAction.type = "handoff_html"`.

## Promotional Tile Plan

### Small Promotional Tile `440x280`

Source template: `public/store/promo-tile-440x280.source.svg`

Role:

- Required listing promotional tile.
- Should be readable at small size.
- Avoid dense UI screenshots inside the tile.

Final text:

- `FocusGate / 守界`
- `守住注意力边界`
- `睡眠 · 工作 · 戒断`

Export target:

- `public/store/promo-tile-440x280.png`

### Marquee Promotional Tile `1400x560`

Source template: `public/store/marquee-1400x560.source.svg`

Role:

- Optional wide promotional tile for featured surfaces and future campaigns.
- Can show simplified product panels because there is enough width.

Final text:

- `FocusGate / 守界`
- `该专注时，守住你的注意力边界。`
- `用规则组为睡眠、工作和戒断场景建立可执行的网站边界。`

Export target:

- `public/store/marquee-1400x560.png`

## Placeholder Source Assets

The SVG files in `public/store/` are source templates, not final store screenshots:

- `promo-tile-440x280.source.svg`
- `marquee-1400x560.source.svg`
- `screenshot-frame-1280x800.source.svg`

Use them for layout, design direction, and export scaffolding. Replace screenshot placeholders with real captured UI before submission.

## Suggested Capture Workflow

1. Build the extension with `npm run build`.
2. Load `dist/` as an unpacked extension in Chrome or run the existing local dev surface on a non-default port.
3. Seed extension storage with deterministic rule groups and events.
4. Capture each final `1280x800` screenshot with `npm run store:screenshots`.
5. Export promotional templates to PNG with `npm run store:assets`.
6. Review every image at full size and at reduced store-card size.
7. Verify there is no private data, no unbuilt feature claim, and no mismatch with `prd.md` or `DESIGN.md`.

Detailed capture instructions live in `screenshot-capture-runbook.md`.

## Open Work Before Submission

- Re-capture screenshots with `npm run store:screenshots` after any UI or copy change that affects the five store scenes.
- If the Chrome Web Store listing targets English users too, create a separate localized asset set instead of mixing Chinese and English inside one image.
