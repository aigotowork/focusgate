# 晚安边界 / GoodNight Guard

一个 Chrome / Edge 浏览器插件：在你设定的晚安时间之后，提醒你停止浏览高刺激网站，并用温和但明确的边界帮助你关掉网页。

## 当前状态

项目已初始化为 Manifest V3 浏览器插件骨架，包含：

- Popup：查看晚安模式、当前网站状态、今日阻断数据。
- Options：配置睡眠计划、阻断网站、解锁时长和承诺语。
- Block Page：到点访问受限网站时显示全屏晚安边界，并提供带冷静期的临时解锁。
- Shared Logic：时间窗口、站点匹配、设置存储和事件记录。

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
src/shared/      可测试的规则、时间、存储和默认设置
src/popup/       插件弹窗
src/options/     设置页
src/block/       阻断页
tests/           Vitest 单元测试
tests/e2e/       Playwright 冒烟测试
public/          manifest.json
```

产品需求见 `prd.md`，视觉与文案原则见 `DESIGN.md`，MV3 架构说明见 `docs/architecture.md`。
