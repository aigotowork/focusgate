# FocusGate / 守界

FocusGate / 守界 是一个本地优先的 Chrome / Edge 浏览器扩展，用规则组为睡眠、工作、学习和数字戒断场景建立可执行的网站访问边界。

它不是惩罚工具，也不承诺让网站“绝对无法打开”。它更像一个提前设好的门槛：在你清醒的时候写下边界，到容易分心、疲惫或冲动的时候，由浏览器替你把这个决定摆回眼前。

## 适合什么场景

- 睡前已经很困，却还是反复打开视频、社区、小说和新闻。
- 工作或学习时本来只是查资料，几分钟后却被信息流带走。
- 周末想减少短视频、论坛、直播和购物，却总是在无意识中点开。
- 想保留必要的临时通道，但希望每一次破例都慢一点、清楚一点。

FocusGate / 守界 的默认规则组是“晚安守护”，用于睡眠边界。你也可以创建“工作时间专注”“备考冲刺”“周末戒断”等规则组，让每个生活场景拥有独立的时间、网站、提醒、阻断页和临时解锁策略。

## 它怎么工作

1. 创建一个规则组，例如“晚安守护”或“工作时间专注”。
2. 设置生效时间、星期和受限网站，例如每天 `23:00-07:00` 限制 `youtube.com`、`bilibili.com`、`reddit.com`。
3. 配置提前提醒、阻断强度、临时解锁时长和阻断页文案。
4. 到点后访问受限网站时，浏览器会显示阻断页，并提供关闭页面、打开承接页或按规则临时解锁等操作。

一个规则组可以只服务一个场景。睡眠边界不必和工作边界混在一起，周末戒断也不必影响工作日的正常资料查询。

## 快速开始

```bash
npm install
npm run build
```

然后在 Chrome / Edge 扩展管理页打开“开发者模式”，选择“加载已解压的扩展”，加载生成的 `dist/` 目录。

首次安装后会打开 Welcome 页面。建议先保留默认的“晚安守护”，添加 3 到 5 个最容易在睡前失控的网站，确认时间窗口和提醒设置后再创建其他规则组。

## 隐私边界

当前 MVP 采用本地优先设计：

- 规则组、受限域名、临时解锁和统计默认保存在浏览器本地。
- 不提供账号系统，不进行云同步，不出售用户数据。
- 不读取页面正文、表单输入、账号密码或页面标题。
- 统计默认记录域名级事件，用于显示阻断、解锁和提醒等本地复盘信息。

扩展需要知道当前访问的 URL / 域名，才能判断它是否命中你自己设置的规则组。更多说明见公开隐私政策：`docs/privacy/index.html`。

## 用户入口与公开文档

GitHub Pages 公开站点位于 `docs/`：

- 首页：`https://aigotowork.github.io/focusgate/`
- 支持：`https://aigotowork.github.io/focusgate/support/`
- 隐私政策：`https://aigotowork.github.io/focusgate/privacy/`
- Blog：`https://aigotowork.github.io/focusgate/blog/`

中文是默认公开版本；英文版本位于 `/en/` 和 `/blog/en/`；法文版本目前覆盖首页、支持和隐私政策。

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
- `npm run build` 生成 `dist/`，可在 Chrome / Edge 的扩展管理页中加载。

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
docs/            GitHub Pages 公开站点、隐私政策、支持页和 blog
project-docs/    内部架构、上架清单、文案、截图流程和历史资料
```

产品需求见 `prd.md`，视觉与文案原则见 `DESIGN.md`，MV3 架构说明见 `project-docs/architecture.md`，页面内提醒设计见 `project-docs/reminder-experience.md`。历史 UI 草图已归档到 `project-docs/archive/`，不要作为当前实现依据。

## 上架准备

Chrome Web Store 发布资料集中在 `project-docs/store/`：

- `project-docs/store/publishing-checklist.md`：发布总控清单，包含打包、后台字段、隐私声明和审核测试说明。
- `project-docs/store/dashboard-fields.md`：Chrome Web Store 后台逐项填写内容，可直接复制。
- `project-docs/store/automation.md`：CWS API 自动上传、提交审核、查状态和 GitHub Actions 配置。
- `project-docs/store/store-listing-draft.md`：中文商店文案草稿。
- `project-docs/store/privacy-policy-draft.md`：公开隐私政策草稿镜像。
- `project-docs/store/permission-justification-draft.md`：权限用途说明。
- `project-docs/store/screenshot-capture-runbook.md`：截图种子数据、场景和文件名。

常用发布命令：

```bash
npm run store:assets
npm run store:screenshots
npm run package:store
npm run store:cws:upload
npm run store:cws:submit
npm run store:cws:status
```

`npm run package:store` 会重新构建并生成 `artifacts/chrome-web-store/focusgate-<version>.zip`。`store:cws:*` 命令需要先提供 `CWS_PUBLISHER_ID` 和 Chrome Web Store API 凭据，推荐使用服务账号；具体见 `project-docs/store/automation.md`。

## 手动验收

```bash
npm run build
```

然后在 Chrome / Edge 扩展管理页加载 `dist/`。首次安装会打开 `welcome.html`；进入设置后保留默认的“晚安守护”，再创建一个“工作时间专注”规则组，例如周一至周五 `09:00-18:00` 阻断 `bilibili.com`。

在“阻断页展示”里把标题改成“现在是专注时间”，也可以开启静态 HTML 自定义，或把主按钮行为设为跳转到工作清单 / 打开承接页。把规则开始时间调到当前时间后访问该域名，应跳转到阻断页并显示命中的规则组名称和对应展示内容。把开始时间调到未来 15 分钟内，并保持提前提醒开启，再访问该域名，应看到右下角倒计时浮层。若在规则开始前已经打开该网站，到点后也应自动跳转阻断页。完成临时解锁后可返回原网站；解锁只对当前规则组生效。
