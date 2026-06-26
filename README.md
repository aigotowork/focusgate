# 晚安边界 / GoodNight Guard

一个 Chrome / Edge 浏览器插件：在你设定的晚安时间之后，提醒你停止浏览高刺激网站，并用温和但明确的边界帮助你关掉网页。

## 当前状态

项目已进入 MVP 闭环，包含：

- Onboarding：首次安装后引导完成睡眠时间、提醒、网站和强度设置。
- Popup：查看晚安模式、当前网站状态、今晚阻断和解锁数据。
- Options：配置睡眠计划、阻断网站、提醒、强度、解锁、统计和隐私数据。
- Block Page：到点访问受限网站时显示全屏晚安边界，并提供带冷静期、原因选择和次数限制的临时解锁。
- Background：监听导航、发送睡前提醒、清理过期解锁状态。
- Shared Logic：时间窗口、睡眠 session、站点匹配、解锁限制、统计聚合和本地存储。

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

然后在 Chrome / Edge 扩展管理页加载 `dist/`。首次安装会打开设置页；把睡眠时间调到当前时段，访问阻断列表中的域名，应跳转到阻断页。完成临时解锁后可返回原网站；解锁过期后再次访问应重新阻断。
