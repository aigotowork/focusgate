# FocusGate / 守界 Permission Justification Draft

Sources: [`../../prd.md`](../../prd.md), [`../../README.md`](../../README.md), [`../architecture.md`](../architecture.md), [`../../public/manifest.json`](../../public/manifest.json), [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies), [Privacy Policies](https://developer.chrome.com/docs/webstore/program-policies/privacy), [Limited Use](https://developer.chrome.com/docs/webstore/program-policies/limited-use).

Audience: Chrome Web Store reviewer / submission checklist.

## Single Purpose

FocusGate / 守界 is a local-first website boundary extension. Users create rule groups with schedules and restricted domains for sleep, work, study, or digital-withdrawal scenarios. The extension evaluates browser navigation against those user-defined rules, redirects restricted sites to an extension block page, shows pre-boundary reminders, allows limited temporary unlocks, and stores local domain-level events for user-facing stats.

It does not read page bodies, form values, account credentials, or page titles. It does not provide account login, cloud sync, advertising, or remote analytics in the current MVP.

## Permission Justifications

| Permission | Justification |
| --- | --- |
| `storage` | Stores user-configured rule groups, restricted domains, schedules, commitments, block-page settings, temporary unlock sessions, reminder state, pause state, and local domain-level event history. Without this permission the extension cannot remember user rules or restore unlock/block behavior across browser sessions. |
| `tabs` | Reads and updates tab URLs so the service worker can redirect a top-level tab from a restricted site to the extension block page, open the first-install welcome page, and scan already-open HTTP(S) tabs when a scheduled rule begins. The extension uses this for navigation enforcement, not full browsing-history collection. |
| `activeTab` | Lets the popup identify the current active page when the user opens the extension, show whether the current domain is restricted or upcoming, and add that domain to a selected rule group. This keeps the popup workflow scoped to the tab the user is actively viewing. |
| `webNavigation` | Observes top-frame navigation events so the extension can evaluate whether the destination URL matches an enabled rule group during its scheduled window. This is the core enforcement path for redirecting restricted sites to the block page. |
| `alarms` | Schedules exact reminder/block ticks, periodic expired-unlock cleanup, and checks for tabs that were already open when a rule window starts. MV3 service workers cannot rely on long-lived memory, so alarms provide reliable low-frequency scheduling. |
| `notifications` | Shows one quiet system notification before a rule group begins, when configured by the user. Notifications are used for pre-boundary reminders only. |
| `<all_urls>` host permission | Required because users can add arbitrary HTTP(S) domains to their own rule groups. The extension needs to evaluate navigation and show the reminder overlay on any site the user may choose to restrict. The implementation uses host access to inspect URLs/domains and inject a low-stimulation reminder overlay; it does not read page body content, form fields, credentials, or page titles. |

## Data Use Summary

Data stored locally:

- Rule group configuration.
- User-added restricted domains.
- Schedules, reminder windows, and block modes.
- Temporary unlock sessions and optional unlock reasons.
- Domain-level events such as `blocked`, `unlocked`, `site_added`, `paused`, `reminded`, and `cleared`.
- Static custom block-page or handoff HTML written by the user.

Data not collected by design:

- Page text or DOM content.
- Form input values.
- Login credentials.
- Page titles.
- Full browsing history unrelated to configured rule evaluation.
- Remote analytics identifiers.

## Least-Privilege Notes

The current architecture uses `webNavigation` plus `tabs.update` instead of blocking `webRequest`. It stores settings and events locally through `chrome.storage.local`, caps local event history, and records domain-level events for stats. The content script is limited to HTTP(S) pages and displays only a reminder overlay when the current host is inside an upcoming user-configured rule window.

`<all_urls>` is broad but functionally necessary because the extension cannot predict which domains the user will add to rule groups. Narrow fixed host permissions would break the primary user workflow.

## Chrome Web Store Privacy Disclosure Draft

Suggested disclosure wording for the CWS privacy practices section:

守界会在浏览器本地处理“网站内容 / 网络活动”相关的域名级信息，用于判断当前网站是否命中用户设置的规则组、显示提醒或阻断页，并生成本地统计。守界不会读取页面正文、表单输入、账号密码或页面标题，不会出售数据，也不会将规则组、受限域名、解锁原因或统计事件上传给开发者服务器。当前 MVP 不包含账号系统、云同步或远程分析服务。

## Reviewer Notes

The extension's current manifest requests:

```json
"permissions": ["activeTab", "alarms", "notifications", "storage", "tabs", "webNavigation"],
"host_permissions": ["<all_urls>"]
```

The permission set matches the architecture doc as of 2026-06-26. If future implementation switches to `declarativeNetRequest`, adds sync, or narrows host access through optional permissions, update this draft together with `public/manifest.json` and `project-docs/architecture.md`.

## Unresolved Assumptions

- This draft assumes no remote telemetry, account sync, crash reporting, ads, or third-party SDKs.
- This draft assumes the CWS privacy disclosure will describe domain-level URL processing as necessary for the extension's single purpose.
- If the final submission uses optional host permissions or removes any manifest permission, revise the table before filing.
