# FocusGate / 守界 Privacy Policy Draft

Last updated: 2026-06-26

Sources: [`../../prd.md`](../../prd.md), [`../../README.md`](../../README.md), [`../architecture.md`](../architecture.md).

Status: Draft mirror for Chrome Web Store submission. Public hosted source lives in `../../docs/privacy/index.html`.

## 隐私政策

FocusGate / 守界（以下简称“守界”）是一个浏览器扩展，用于按用户设置的规则组限制容易分心的网站，帮助用户在睡眠、工作、学习和数字戒断等场景中守住注意力边界。

我们把隐私作为产品边界的一部分。当前 MVP 版本默认本地优先运行，不提供账号系统，不进行云同步，也不出售用户数据。

## 我们会处理哪些数据

守界会在你的浏览器本地保存以下数据，用于实现你主动配置的网站边界功能：

- 规则组设置：规则组名称、启用状态、时间排程、生效星期、受限域名、承诺语、提醒时间、阻断强度、临时解锁设置、阻断页展示配置。
- 网站规则：你添加到规则组中的域名，例如 `youtube.com`、`bilibili.com` 或其他你自己设置的网站。
- 临时解锁状态：被解锁的域名、对应规则组、解锁开始时间、过期时间、解锁时长、阻断模式和可选解锁原因。
- 本地统计事件：阻断、解锁、添加站点、暂停、提醒、清空等事件，以及事件对应的域名、规则组和时间。
- 自定义展示内容：你在设置页中写入的静态阻断页 HTML、承接页 HTML、标题、说明和主按钮配置。

## 我们不会收集哪些数据

当前版本不会主动收集、上传或出售以下信息：

- 页面正文内容。
- 表单输入内容。
- 账号、密码或身份凭据。
- 页面标题。
- 完整浏览历史。
- 浏览器中非 HTTP(S) 页面内容。
- 与守界功能无关的个人资料。

守界只需要判断当前访问的 URL 域名是否命中你设置的规则组。用于统计的事件默认是域名级信息，而不是页面内容级信息。

## 数据如何存储

当前版本的数据默认保存在浏览器本地存储中，包括 Chrome 扩展的 `chrome.storage.local`，以及开发环境中的本地存储回退。

这些数据主要留在你的设备上，用于：

- 判断某个网站是否应该在当前时间被限制。
- 显示阻断页、提醒和承接页。
- 执行临时解锁和自动过期恢复。
- 在设置页展示本地统计和复盘信息。

当前 MVP 不提供账号登录、云同步或远程分析服务。

## 数据是否会分享

当前版本不会把你的规则组、受限域名、解锁原因、统计事件或自定义 HTML 上传给开发者服务器，也不会出售给广告商、数据经纪商或其他第三方。

如果未来版本加入云同步、账号系统、崩溃分析或跨设备功能，本隐私政策应先更新，并在产品中清楚说明新增数据用途和用户选择。

守界对用户数据的使用将遵守 Chrome Web Store User Data Policy，包括 Limited Use 要求。守界只会将数据用于提供或改进本扩展明确说明的网站边界功能。

## 权限用途

守界请求的浏览器权限只用于实现网站边界功能：

- `storage`：保存规则组、站点、解锁状态和本地统计。
- `tabs`：读取或更新浏览器标签页，以便在受限网站命中规则时跳转到阻断页。
- `activeTab`：让弹窗识别当前标签页域名，并支持把当前网站加入规则组。
- `webNavigation`：观察顶层页面导航，判断访问的网站是否需要被阻断。
- `alarms`：安排提醒、阻断检查和过期解锁清理。
- `notifications`：在规则即将开始时显示系统通知。
- `<all_urls>` 主机权限：在用户可能配置的任意 HTTP(S) 网站上判断域名是否命中规则，并显示提前提醒浮层。

守界不会使用这些权限读取页面正文、表单输入、账号信息或页面标题。

## 用户控制

你可以在扩展设置页中：

- 创建、编辑、启用或删除规则组。
- 添加或删除受限域名。
- 修改提醒、阻断强度和临时解锁规则。
- 清空本地统计事件。
- 关闭或卸载扩展，停止守界继续执行规则。

浏览器扩展卸载后的数据删除行为受 Chrome / Edge 扩展存储机制影响。你也可以在卸载前先通过设置页清空本地统计。

## 儿童隐私

守界不是专门面向儿童设计的产品。当前版本不提供账号系统，也不会主动要求用户提交年龄、姓名、联系方式或其他身份信息。

## 政策变更

如果未来版本的数据处理方式发生实质变化，例如加入账号、云同步、远程备份、遥测分析或第三方服务，我们会更新本隐私政策，并在适当位置说明变化。

## 联系方式

如有隐私相关问题，请联系：

`long@aigotowork.work`

开发者 / 发布者：

`aigotowork`

## Reviewer Notes

This draft reflects the current MVP described in the product and architecture docs. It assumes there is no account system, remote analytics, server-side sync, advertising SDK, or third-party data sharing. If those capabilities are added, this policy must be revised before publication.

## Unresolved Assumptions

- Hosted privacy policy URL: `https://aigotowork.github.io/focusgate/privacy/`.
- Support URL: `https://aigotowork.github.io/focusgate/support/`.
- Confirm whether future release plans include sync, telemetry, crash reporting, or paid features; this draft says they are absent in the current MVP.
