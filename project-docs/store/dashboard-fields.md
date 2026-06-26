# Chrome Web Store Dashboard 填写手册

Last reviewed: 2026-06-26

目标：把 Chrome Web Store Developer Dashboard 里需要手动填写的内容集中到一个可复制的清单。首次发布必须先在 Dashboard 填完 Store listing、Privacy、Distribution 等页面；后续包体上传和提交审核可以用 `scripts/cws-api.mjs` 自动化。

官方参考：

- Store listing 字段：<https://developer.chrome.com/docs/webstore/cws-dashboard-listing>
- Privacy 字段：<https://developer.chrome.com/docs/webstore/cws-dashboard-privacy>
- User Data FAQ：<https://developer.chrome.com/docs/webstore/program-policies/user-data-faq>
- CWS API：<https://developer.chrome.com/docs/webstore/using-api>
- Service account：<https://developer.chrome.com/docs/webstore/service-accounts>
- API v2 discovery：`https://chromewebstore.googleapis.com/$discovery/rest?version=v2`

## 已确定信息

| 字段 | 填写值 |
| --- | --- |
| 扩展 / draft item ID | `hgjbamghlljcjckbcibjgknaidedaibi` |
| 发布者显示名 | `aigotowork` |
| 支持邮箱 | `long@aigotowork.work` |
| 商店展示名称 | `守界 - FocusGate` |
| Manifest name | `守界 - FocusGate` |
| Manifest short_name | `守界` |
| 首页 URL | `https://aigotowork.github.io/focusgate/` |
| 支持 URL | `https://aigotowork.github.io/focusgate/support/` |
| 隐私政策 URL | `https://aigotowork.github.io/focusgate/privacy/` |
| 价格 | `Free` |
| 发布范围 | 先 `Private / Trusted testers`，测试通过后切到 `Public` |
| 地区 | 所有地区 |

## 你还需要提供

| 项目 | 用途 | 获取方式 |
| --- | --- | --- |
| `CWS_PUBLISHER_ID` | API v2 路径需要，不是公开发布者名称 | Chrome Web Store Developer Dashboard -> `Publisher` -> `Settings`，页面会显示 Publisher ID。若有多个 publisher，先切到 `aigotowork` 对应账号。 |
| Trusted tester 邮箱列表 | 首轮私测发布范围 | 在 Dashboard 的 Distribution / Trusted testers 配置里添加。给我邮箱列表即可，我会同步写进发布检查表。 |
| GitHub Pages 是否已开启 | 隐私、首页、支持 URL 必须公开可访问 | GitHub repo -> `Settings` -> `Pages` -> Source 选 `Deploy from a branch`，Branch 选 `main`，Folder 选 `/docs`。 |
| CWS API 服务账号 JSON | 自动上传 / 提交审核 | 见 `project-docs/store/automation.md`。不要把 JSON 发到公开渠道或提交到 git。 |
| GitHub Actions Secrets | CI 手动发布 | `CWS_EXTENSION_ID`、`CWS_PUBLISHER_ID`、`CWS_SERVICE_ACCOUNT_JSON`。 |

## Package

上传文件：

```text
artifacts/chrome-web-store/focusgate-0.1.0.zip
```

生成命令：

```bash
npm run package:store
```

上传前确认：

- zip 根目录直接包含 `manifest.json`，不要有外层 `dist/` 文件夹。
- zip 不包含 `public/store/` 素材源文件、`.map`、`node_modules/`。
- 版本号必须高于上一次已上传版本。

## Store Listing

### Product details

Name / 商品名称：

```text
守界 - FocusGate
```

Summary / 简短说明：

```text
用规则组为睡眠、工作和戒断场景建立可执行的网站边界。
```

Category / 分类：

```text
Productivity
```

Language / 语言：

```text
Chinese (Simplified) / zh-CN
```

Mature content / 成人内容：

```text
No
```

说明：FocusGate / 守界不包含性暗示、暴力、强语言，且不聚焦酒精、烟草、药物销售或消费。

Detailed description / 详细说明：

```text
FocusGate / 守界帮助你在清醒时预设边界，在容易分心时执行边界。

它不是惩罚工具，也不承诺“无法绕过”。它更像一扇你亲手设下的门：到了该休息、该专注、该离开信息流的时候，浏览器会把你带回自己提前写下的承诺。

你可以用守界做这些事：

- 为不同生活场景创建独立规则组，例如“晚安守护”“工作时间专注”“周末戒断”。
- 给每个规则组设置生效时间、星期、受限网站、承诺语和阻断强度。
- 在限制开始前收到低刺激提醒，给自己一点收尾时间。
- 到达限制时间后，将受限网站跳转到清晰、安静的阻断页。
- 设置临时解锁时长、次数限制和可选原因记录，让破例不再毫无成本。
- 在扩展弹窗中快速查看当前网站状态，或把当前网站加入某个规则组。
- 在设置页查看本地统计，了解今天、本周期和近 7 天的阻断与解锁情况。
- 自定义阻断页文案、主按钮动作和静态承接页，把“离开网站后做什么”也提前安排好。

隐私设计：

- 设置、规则组、解锁状态和统计默认保存在浏览器本地。
- 不需要账号登录。
- 不上传浏览记录、页面正文、表单输入、账号信息或页面标题。
- 统计只围绕域名级事件，例如哪个域名被阻断、是否临时解锁、是否添加到规则组。

适合你在这些时刻使用：

- 睡前想放下视频、社区、小说、新闻和短内容。
- 工作或学习时想减少社交、购物、娱乐网站的牵引。
- 周末或休息日想降低高刺激内容的摄入。
- 需要一个温和但可见的边界，而不是靠意志力临场对抗。

默认规则组“晚安守护”用于睡眠场景。你也可以创建自己的规则组，让守界服务于任何需要注意力边界的时间段。
```

### Graphic assets

| Dashboard 字段 | 文件 |
| --- | --- |
| Store icon `128x128` | `public/icon-128.png` |
| Screenshot 1 | `public/store/screenshot-01-welcome-1280x800.png` |
| Screenshot 2 | `public/store/screenshot-02-options-1280x800.png` |
| Screenshot 3 | `public/store/screenshot-03-popup-1280x800.png` |
| Screenshot 4 | `public/store/screenshot-04-block-1280x800.png` |
| Screenshot 5 | `public/store/screenshot-05-handoff-1280x800.png` |
| Small promotional tile `440x280` | `public/store/promo-tile-440x280.png` |
| Marquee promotional tile `1400x560` | `public/store/marquee-1400x560.png` |
| Promo video | 留空 |

截图和宣传图生成命令：

```bash
npm run store:assets
npm run store:screenshots
```

### Related sites

Homepage URL：

```text
https://aigotowork.github.io/focusgate/
```

Support URL：

```text
https://aigotowork.github.io/focusgate/support/
```

Privacy policy URL：

```text
https://aigotowork.github.io/focusgate/privacy/
```

Official URL：

```text
留空，除非 Dashboard 下拉框里已经出现已验证的 aigotowork.github.io/focusgate 或自有域名。
```

说明：Official URL 需要站点所有权验证。Homepage URL 不等于 Official URL；如果页面显示 `None`，且还没有通过 Google Search Console 验证可选站点，可以先保持 `None`。

## Privacy

说明：这一节按 Chrome Web Store Developer Dashboard 的 `Privacy` 页面字段顺序排列。官方 User Data FAQ 把 `domains or URLs the browser interacts with` 纳入 web browsing activity，并说明即使只在本地存储敏感用户信息，也需要发布隐私政策。因此这里采用保守披露：承认本地处理 `Web history` 和 `User activity`，同时明确不上传、不出售、不用于广告。

### Single purpose

Single purpose description：

```text
FocusGate / 守界 lets users create local rule groups that limit access to user-selected websites during scheduled focus, sleep, study, or digital-withdrawal windows.
```

### Permission justifications

activeTab justification：

```text
Lets the popup identify the current active page when the user opens the extension, show whether the current domain is restricted or upcoming, and add that domain to a selected rule group. This keeps the popup workflow scoped to the tab the user is actively viewing.
```

alarms justification：

```text
Schedules exact reminder/block ticks, periodic expired-unlock cleanup, and checks for tabs that were already open when a rule window starts. MV3 service workers cannot rely on long-lived memory, so alarms provide reliable low-frequency scheduling.
```

notifications justification：

```text
Shows one quiet system notification before a rule group begins, when configured by the user. Notifications are used for pre-boundary reminders only.
```

storage justification：

```text
Stores user-configured rule groups, restricted domains, schedules, commitments, block-page settings, temporary unlock sessions, reminder state, pause state, and local domain-level event history. Without this permission the extension cannot remember user rules or restore unlock/block behavior across browser sessions.
```

tabs justification：

```text
Reads and updates tab URLs so the service worker can redirect a top-level tab from a restricted site to the extension block page, open the first-install welcome page, and scan already-open HTTP(S) tabs when a scheduled rule begins. The extension uses this for navigation enforcement, not full browsing-history collection.
```

webNavigation justification：

```text
Observes top-frame navigation events so the extension can evaluate whether the destination URL matches an enabled rule group during its scheduled window. This is the core enforcement path for redirecting restricted sites to the block page.
```

Host permission justification：

```text
Required because users can add arbitrary HTTP(S) domains to their own rule groups. The extension needs to evaluate navigation and show the reminder overlay on any site the user may choose to restrict. The implementation uses host access to inspect URLs/domains and inject a low-stimulation reminder overlay; it does not read page body content, form fields, credentials, or page titles.
```

### Remote code

Are you using remote code?

```text
No, I am not using Remote code
```

Justification：

```text
留空。选择 No 后通常不需要填写。
```

如果 Dashboard 仍要求填写说明，使用：

```text
Not applicable. All JavaScript and CSS are packaged with the extension. FocusGate / 守界 does not load external scripts, external modules, or WebAssembly, and does not use eval() to execute remote code.
```

### Data usage disclosure

建议走保守披露口径：不是“完全不处理用户数据”，而是“只在本地处理，为核心功能使用，不上传、不出售、不用于广告”。这样更贴合本插件的实际行为，因为扩展确实会读取当前 URL / 域名来判断是否命中规则。

勾选建议：

| Dashboard 项 | 建议 |
| --- | --- |
| Personally identifiable information | 不勾选 |
| Health information | 不勾选 |
| Financial and payment information | 不勾选 |
| Authentication information | 不勾选 |
| Personal communications | 不勾选 |
| Location | 不勾选 |
| Web history | 勾选。仅处理当前 URL / 域名、用户配置的受限域名，以及与阻断、提醒、解锁相关的域名级本地事件；不保存完整浏览历史、不读取页面标题。 |
| User activity | 勾选。仅处理用户在扩展内触发的添加站点、启停规则、临时解锁、暂停、清空统计、提醒/阻断事件；不记录页面点击、鼠标位置、滚动或键盘输入。 |
| Website content | 不勾选。content script 只读取 `window.location.href` 并注入提醒浮层，不读取正文、图片、声音、视频、链接集合、表单内容或页面标题。 |

如果勾选后页面出现用途说明输入框，使用：

```text
守界会在浏览器本地处理域名级的 Web browsing activity 和用户操作事件，用于判断当前网站是否命中用户设置的规则组、显示提醒或阻断页，并生成本地统计。守界不会读取页面正文、表单输入、账号密码或页面标题，不会出售数据，也不会将规则组、受限域名、解锁原因或统计事件上传给开发者服务器。当前 MVP 不包含账号系统、云同步、广告、远程分析或第三方数据共享。
```

### Certifications

三项都必须勾选：

```text
I do not sell or transfer user data to third parties, outside of the approved use cases
```

```text
I do not use or transfer user data for purposes that are unrelated to my item's single purpose
```

```text
I do not use or transfer user data to determine creditworthiness or for lending purposes
```

### Privacy policy URL

```text
https://aigotowork.github.io/focusgate/privacy/
```

## Distribution

Visibility：

```text
Private / Trusted testers
```

测试通过后再切到：

```text
Public
```

Regions：

```text
All regions
```

Pricing：

```text
Free
```

In-app purchases：

```text
No
```

## Test instructions

```text
Install the extension and open the welcome page. Open Options, keep the default "晚安守护" rule group, or create a new "工作时间专注" rule group. Add a test domain such as example.com, set the schedule to the current time window, and save. Visit the domain in a normal tab; the extension should redirect the top-level navigation to its block page and show the matching rule group, blocked domain, commitment, primary action, and temporary unlock path. To test reminders, set a rule to start within the configured reminder window, save, and visit the listed domain before the start time; the page should show a quiet reminder overlay. All settings and stats are stored locally.
```

## 首次发布和自动化边界

- Draft item ID 已有：`hgjbamghlljcjckbcibjgknaidedaibi`。
- 仅有 item ID 还不能让我直接替你发布；还需要 Dashboard 手动资料完成，以及 CWS API 凭据。
- 首次发布前，Store listing 和 Privacy tabs 必须在 Dashboard 填完。
- 自动化可以负责：上传新 zip、提交审核、查状态、符合条件时调整灰度比例。
- Trusted testers 不是 API v2 的 `publishType`。先在 Dashboard Distribution 里把可见性设置为测试者，再用 API `DEFAULT_PUBLISH` 提交审核。
