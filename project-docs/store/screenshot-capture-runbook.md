# Store Screenshot Capture Runbook

Last reviewed: 2026-06-26

This runbook turns the visual plan into reproducible screenshot work. Final screenshots must show the built extension UI, not SVG placeholders.

Canonical command:

```bash
npm run store:screenshots
```

## Design Brief

- Surface type: Chrome Web Store listing screenshots.
- User: Chinese-speaking desktop Chrome / Edge users evaluating whether FocusGate / 守界 can help them protect sleep, focus, study, and digital-withdrawal boundaries.
- Primary goal: prove the extension is useful, calm, local-first, and configurable by rule group.
- Constraints: `1280x800` PNG output, Chinese visual text, no personal data, no unbuilt feature claims, light-first Gate Daylight UI from `DESIGN.md`.
- Aesthetic direction: quiet daylight interface, real product surfaces, clear rule-group structure.
- Signature moment: the block page shows a user-defined boundary at the exact moment a distracting domain is stopped.
- Complexity level: restrained.

## Output Filenames

Save final reviewed screenshots under `public/store/`:

```text
screenshot-01-welcome-1280x800.png
screenshot-02-options-1280x800.png
screenshot-03-popup-1280x800.png
screenshot-04-block-1280x800.png
screenshot-05-handoff-1280x800.png
```

Do not upload `*.source.svg` files or generated screenshots that still contain placeholder labels.

## Seed Data

Use deterministic local storage when capturing dev-server screenshots. The canonical storage key is `goodnightGuard.settings`; events use `goodnightGuard.events`.

Recommended rule groups:

| Rule group | Schedule | Sites | Purpose |
| --- | --- | --- | --- |
| `晚安守护` | `23:00-07:00`, every day | `youtube.com`, `bilibili.com`, `reddit.com` | Default sleep boundary |
| `工作时间专注` | Current active work window, weekdays | `bilibili.com`, `youtube.com`, `x.com` | Shows non-sleep rule group |
| `周末戒断` | `10:00-22:00`, Saturday and Sunday | `reddit.com`, `news.ycombinator.com` | Shows stricter digital-withdrawal context |

Recommended event history:

- Several `blocked` events for `bilibili.com`, `youtube.com`, and `reddit.com`.
- One or two `unlocked` events for `bilibili.com`.
- One `reminded` event for the active group.

## Capture Workflow

1. Start the dev server, or let the capture script start it:

   ```bash
   npm run dev
   ```

2. Use viewport `1280x800`.
3. Seed `localStorage` before loading each UI surface. The canonical script does this automatically.
4. Hide browser chrome by capturing the page viewport, not the full browser window.
5. Save screenshots as PNG.
6. Review every screenshot at `1280x800` and scaled down to `640x400`.
7. Confirm no private domains, account names, bookmarks, local file paths, or debugging overlays are visible.

## Scene 1: Welcome

- URL: `http://127.0.0.1:51791/welcome.html`
- State: no special seed data required.
- Must show:
  - `FocusGate / 守界`
  - `该专注时，守住你的注意力边界。`
  - Scenario cards for sleep, work, and digital withdrawal.
- Output: `public/store/screenshot-01-welcome-1280x800.png`

## Scene 2: Options

- URL: `http://127.0.0.1:51791/options.html?onboarding=1`
- State: seed all three rule groups and enough events for the stats panel.
- Must show:
  - Rule group list.
  - Rule basics.
  - Website rules.
  - Block strength or block-page configuration.
- Output: `public/store/screenshot-02-options-1280x800.png`

## Scene 3: Popup

The popup depends on the active tab. For dev-server capture, inject a mock `chrome.tabs.query` value before the app loads.

- URL: `http://127.0.0.1:51791/popup.html`
- Mock active tab URL: `https://bilibili.com/video`
- State: seed `工作时间专注` as currently active and containing `bilibili.com`.
- Must show:
  - Current page status.
  - Matched rule group.
  - Today stats.
  - Add-to-rule-group state.
- Output: `public/store/screenshot-03-popup-1280x800.png`

Composition note: because the actual popup is narrow, place it in a simple neutral frame only if the direct screenshot feels too small. The frame must not claim functionality that the extension does not have.

## Scene 4: Block Page

- URL: `http://127.0.0.1:51791/block.html?site=bilibili.com&group=goodnight-boundary`
- State: seed default `晚安守护`.
- Must show:
  - `晚安守护`
  - `已拦截访问：bilibili.com`
  - Commitment copy.
  - Primary action.
  - Quiet temporary unlock path.
- Output: `public/store/screenshot-04-block-1280x800.png`

## Scene 5: Handoff

- URL: `http://127.0.0.1:51791/handoff.html?site=bilibili.com&group=goodnight-boundary`
- State: set `晚安守护.blockPage.primaryAction.type` to `handoff_html` with a calm static checklist.
- Suggested handoff HTML:

```html
<main style="font-family: Inter, PingFang SC, sans-serif; color: #0f172a; padding: 32px;">
  <h2>下一步：收束今晚</h2>
  <ul>
    <li>保存进度</li>
    <li>放下屏幕</li>
    <li>准备明天</li>
  </ul>
</main>
```

- Must show:
  - Handoff page title.
  - Sandboxed static next-step content.
  - FocusGate / 守界 chrome.
- Output: `public/store/screenshot-05-handoff-1280x800.png`

## Visual QA

Use the `frontend-design` visual QA standard:

- The purpose should be obvious without extra explanation.
- There should be one clear focal point per image.
- Text should remain readable when reduced to `640x400`.
- Colors should preserve the Gate Daylight UI, not become a one-note purple theme.
- Screenshots should not be blurry, distorted, padded, skewed, or overloaded with text.

Known caveat:

- Chromium may render native `input[type="time"]` controls with `AM/PM` text even when the Playwright context uses `zh-CN`. This is acceptable for a first launch because the surrounding UI is Chinese and the control reflects real product behavior. If a fully Chinese screenshot is required, update the product time control or adjust the Options screenshot scene instead of editing the captured PNG.

## Open Implementation Work

The current repo includes `scripts/capture-store-screenshots.mjs`. If UI structure changes, update that script and this runbook together so screenshot capture remains reproducible.
