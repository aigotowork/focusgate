# FocusGate / 守界 Chrome Web Store Listing Draft

Audience: Chinese-speaking Chrome / Edge desktop users.

Sources: [`../../prd.md`](../../prd.md), [`../../README.md`](../../README.md), [`../../DESIGN.md`](../../DESIGN.md), [`../architecture.md`](../architecture.md).

## 推荐商店名称

守界 - FocusGate

## 一句话简介

用规则组为睡眠、工作和戒断场景建立可执行的网站边界。

## 简短说明

守界是一个本地优先的网站边界扩展。你可以为睡眠、工作、学习或数字戒断创建不同规则组，在设定时间内限制容易分心的网站，并用温和提醒、阻断页和临时解锁摩擦帮助自己转身离开。

## 详细说明

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

## 功能亮点

- 多规则组：睡眠、工作、学习、戒断可以分开管理。
- 时间排程：支持星期、开始结束时间和跨天规则，例如 `23:00-07:00`。
- 域名规则：添加主域名后可覆盖对应子域名，避免误伤相似域名。
- 提前提醒：限制开始前显示安静的倒计时浮层和系统通知。
- 阻断页：展示命中的规则组、受限网站、承诺语和下一步操作。
- 临时解锁：按规则组和域名单独生效，支持时长、次数限制和可选原因。
- 本地统计：查看阻断、解锁、添加站点、暂停、提醒等域名级事件。
- 本地优先：MVP 不提供账号系统，不进行云同步。

## 商店分类建议

Primary category: Productivity

Rationale: The extension helps users protect focus, sleep, and digital-boundary routines by limiting distracting websites according to local schedules.

## 截图文案建议

1. “用规则组守住不同时间的注意力边界”
2. “晚安、工作、戒断，各有自己的时间和网站”
3. “限制开始前，先给自己一个低刺激提醒”
4. “阻断页显示承诺语，把你带回下一步”
5. “临时解锁有时长、次数和原因摩擦”
6. “统计只保存在本地，帮助你复盘而不是被追踪”

## Reviewer Notes

The extension has a single purpose: user-configured website boundary enforcement for focus, sleep, study, and digital-withdrawal scenarios. It uses local rule groups to evaluate HTTP(S) URLs, redirect restricted top-frame navigation, show reminder overlays, and store domain-level local events for user-facing stats. It does not provide cloud sync or an account system in the current MVP.

## Unresolved Assumptions

- Final store screenshots and promotional images live in `public/store/`; this copy draft does not embed image assets.
- Final public publisher name, support URL, homepage URL, and privacy policy URL are recorded in `project-docs/store/submission-metadata.md`.
- Store listing language is drafted for Chinese users. An English listing would need separate copy.
- The current manifest name and listing name are both `守界 - FocusGate`.
