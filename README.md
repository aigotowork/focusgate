# FocusGate / 守界

一个 Chrome / Edge 浏览器插件：用多个规则组为睡眠、工作和戒断场景建立可执行的网站边界。默认规则组仍是“晚安守护”，但全局品牌已迁移为 FocusGate / 守界。

## 当前状态

项目已进入 MVP 闭环，包含：

- Welcome：首次安装后打开品牌主页，说明“守界”的规则组模型，再进入初始设置。
- Onboarding：引导完成默认规则组的时间、提醒、网站和强度设置。
- Rule Groups：可创建多个规则组，每组都有自己的时间、站点、承诺语、提醒、强度、解锁设置和阻断页展示。
- Popup：优先查看当前网站命中的规则组、阻断/提醒状态，再管理加入规则组、暂停和阻断页预览。
- Options：管理规则组、阻断网站、提醒、强度、解锁、阻断页样式、主按钮承接动作、按组统计和隐私数据。
- Block Page：到点访问受限网站时显示命中的规则组边界，支持按组文案/风格、主按钮动作和静态 HTML 自定义，并提供带冷静期、原因选择和次数限制的临时解锁。
- Handoff Page：主按钮可按规则组跳转到外链或扩展内静态 HTML 承接页，例如睡前科普、工作清单或复盘提示。
- Content Reminder：在受限网站进入提前提醒窗口时显示右下角低刺激倒计时浮层。
- Background：监听导航、按下一次规则时间精确调度提醒/阻断、清理过期解锁状态。
- Shared Logic：规则组、时间窗口、session、站点匹配、阻断页模板、解锁限制、统计聚合、旧设置迁移和本地存储。

## 开发命令

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run test:e2e
npm run build
```

- `npm run dev` 在 `127.0.0.1:51791` 启动本地 UI 调试服务。
- `npm run typecheck` 运行 TypeScript 类型检查。
- `npm test` 运行核心规则单测。
- `npm run test:e2e` 运行 Welcome、Popup、Options、Block Page、Handoff Page 和 Content Reminder 的浏览器级冒烟测试。
- `npm run build` 生成 `dist/`，可在 Chrome / Edge 的扩展管理页中“加载已解压的扩展”。

## 关键目录

```text
src/background/  MV3 后台入口，监听导航并跳转阻断页
src/shared/      可测试的规则、时间、统计、阻断页模板、存储和默认设置
src/content/     页面内提前提醒浮层
src/welcome/     扩展内品牌主页和首次安装入口
src/popup/       插件弹窗
src/options/     设置页
src/block/       阻断页
src/handoff/     主按钮承接页
tests/           Vitest 单元测试
tests/e2e/       Playwright 冒烟测试
public/          manifest.json
public/store/    Chrome Web Store 图片源文件和导出素材
docs/            GitHub Pages 公开站点：首页、支持页、隐私政策
project-docs/    内部架构、上架清单、文案、截图流程和历史资料
```

产品需求见 `prd.md`，视觉与文案原则见 `DESIGN.md`，MV3 架构说明见 `project-docs/architecture.md`，页面内提醒设计见 `project-docs/reminder-experience.md`。
历史 UI 草图已归档到 `project-docs/archive/`，不要作为当前实现依据。

## 上架准备

Chrome Web Store 发布资料集中在 `project-docs/store/`：

- `project-docs/store/publishing-checklist.md`：发布总控清单，包含打包、后台字段、隐私声明和审核测试说明。
- `project-docs/store/dashboard-fields.md`：Chrome Web Store 后台逐项填写内容，可直接复制。
- `project-docs/store/automation.md`：CWS API 自动上传、提交审核、查状态和 GitHub Actions 配置。
- `project-docs/store/store-listing-draft.md`：中文商店文案草稿。
- `project-docs/store/privacy-policy-draft.md`：公开隐私政策草稿镜像。
- `project-docs/store/permission-justification-draft.md`：权限用途说明。
- `project-docs/store/screenshot-capture-runbook.md`：截图种子数据、场景和文件名。

GitHub Pages 公开页面位于 `docs/`，仓库 Pages 发布源应设置为 `main` 分支的 `/docs` 文件夹。目标 URL：

- `https://aigotowork.github.io/focusgate/`
- `https://aigotowork.github.io/focusgate/support/`
- `https://aigotowork.github.io/focusgate/privacy/`

常用发布命令：

```bash
npm run store:assets
npm run store:screenshots
npm run package:store
npm run store:cws:upload
npm run store:cws:submit
npm run store:cws:status
```

`npm run package:store` 会重新构建并生成 `artifacts/chrome-web-store/focusgate-<version>.zip`。
`store:cws:*` 命令需要先提供 `CWS_PUBLISHER_ID` 和 Chrome Web Store API 凭据，推荐使用服务账号；具体见 `project-docs/store/automation.md`。

## 手动验收

```bash
npm run build
```

然后在 Chrome / Edge 扩展管理页加载 `dist/`。首次安装会打开 `welcome.html`；进入设置后保留默认的“晚安守护”，再创建一个“工作时间专注”规则组，例如周一至周五 `09:00-18:00` 阻断 `bilibili.com`。在“阻断页展示”里把标题改成“现在是专注时间”，也可以开启静态 HTML 自定义，或把主按钮行为设为跳转到工作清单/打开承接页。把规则开始时间调到当前时间后访问该域名，应跳转到阻断页并显示命中的规则组名称和对应展示内容。把开始时间调到未来 15 分钟内，并保持提前提醒开启，再访问该域名，应看到右下角倒计时浮层。若在规则开始前已经打开该网站，到点后也应自动跳转阻断页。完成临时解锁后可返回原网站；解锁只对当前规则组生效。
