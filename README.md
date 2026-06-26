# 晚安边界 / GoodNight Guard

一个 Chrome / Edge 浏览器插件：用多个规则组为不同时间段建立数字边界，例如晚安时间不刷娱乐网站、工作时间不打开视频站。

## 当前状态

项目已进入 MVP 闭环，包含：

- Onboarding：首次安装后引导完成睡眠时间、提醒、网站和强度设置。
- Rule Groups：可创建多个规则组，每组都有自己的时间、站点、承诺语、提醒、强度和解锁设置。
- Popup：查看当前规则状态、当前网站命中的规则组、阻断和解锁数据。
- Options：管理规则组、阻断网站、提醒、强度、解锁、按组统计和隐私数据。
- Block Page：到点访问受限网站时显示命中的规则组边界，并提供带冷静期、原因选择和次数限制的临时解锁。
- Background：监听导航、按下一次规则时间精确调度提醒/阻断、清理过期解锁状态。
- Shared Logic：规则组、时间窗口、session、站点匹配、解锁限制、统计聚合、旧设置迁移和本地存储。

## 开发命令

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run test:e2e
npm run build
```

- `npm run dev` 在 `127.0.0.1:5179` 启动本地 UI 调试服务。
- `npm run typecheck` 运行 TypeScript 类型检查。
- `npm test` 运行核心规则单测。
- `npm run test:e2e` 运行 Popup、Options 和 Block Page 的浏览器级冒烟测试。
- `npm run build` 生成 `dist/`，可在 Chrome / Edge 的扩展管理页中“加载已解压的扩展”。

## 关键目录

```text
src/background/  MV3 后台入口，监听导航并跳转阻断页
src/shared/      可测试的规则、时间、统计、存储和默认设置
src/popup/       插件弹窗
src/options/     设置页
src/block/       阻断页
tests/           Vitest 单元测试
tests/e2e/       Playwright 冒烟测试
public/          manifest.json
```

产品需求见 `prd.md`，视觉与文案原则见 `DESIGN.md`，MV3 架构说明见 `docs/architecture.md`。

## 手动验收

```bash
npm run build
```

然后在 Chrome / Edge 扩展管理页加载 `dist/`。首次安装会打开设置页；保留默认的“晚安边界”，再创建一个“工作时间专注”规则组，例如周一至周五 `09:00-18:00` 阻断 `bilibili.com`。把规则时间调到当前时段后访问该域名，应跳转到阻断页并显示命中的规则组名称。若在规则开始前已经打开该网站，到点后也应自动跳转阻断页。完成临时解锁后可返回原网站；解锁只对当前规则组生效。
