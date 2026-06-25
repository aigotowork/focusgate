这是一份为「晚安边界 (GoodNight Guard)」浏览器插件量身定制的 `DESIGN.md` 设计系统文档。你可以将它直接放入项目的根目录或 `docs/` 目录中，供开发和设计人员参考。

---

# 晚安边界 (GoodNight Guard) 设计系统

欢迎来到「晚安边界」的设计系统文档。本系统被命名为 **Nightfall UI (夜幕设计系统)**。

「晚安边界」是一款帮助用户在睡前建立数字边界、阻断熬夜行为的浏览器插件。由于产品的使用场景绝大多数发生在**深夜**和**用户疲劳/意志力薄弱**的时刻，我们的设计系统必须服务于这一特殊场景。

## 1. 设计原则 (Design Principles)

1. **暗黑优先，宁静安抚 (Dark-First & Calm)**
   - 默认且仅提供暗色模式 (Dark Mode)。
   - 避免使用高饱和度、高亮度的刺眼色彩。界面应像夜晚一样安静，减少对用户视觉和神经的刺激。
2. **刻意摩擦 (Intentional Friction)**
   - 顺应人性的操作（如：去睡觉、关闭网页）应该极其顺滑、按钮巨大且显眼。
   - 违背睡眠目标的操作（如：临时解锁、修改规则）应该充满“刻意的摩擦力”（如：倒计时、输入确认语、较小的文字链接）。
3. **清晰的边界感 (Clear Boundaries)**
   - 正常模式与晚安模式必须有明显的视觉区分。
   - 阻断页面必须具有足够的视觉重量，让用户瞬间意识到“我已经越界了”。
4. **理性与共情并重 (Rational & Empathetic)**
   - 文案和视觉不应带有“爹味”或恐吓感。使用用户自己设定的承诺语，用“未来的自己”劝导“现在的自己”。

---

## 2. 色彩系统 (Color Palette)

我们基于 Tailwind CSS 的色板构建了 Nightfall UI 的色彩系统，以 **Slate (蓝灰)** 和 **Indigo (靛蓝)** 为核心。

### 2.1 基础背景色 (Backgrounds)
用于构建界面的层级和深度。

| 变量名 | Tailwind 类 | 颜色值 | 用途 |
| --- | --- | --- | --- |
| `bg-base` | `bg-slate-950` | `#020617` | 最底层的背景（如阻断页背景、设置页侧边栏） |
| `bg-surface` | `bg-slate-900` | `#0f172a` | 基础面板背景（如 Popup 背景、设置页主内容区） |
| `bg-elevated` | `bg-slate-800` | `#1e293b` | 悬浮卡片、模块面板、按钮默认态 |
| `bg-elevated-hover` | `bg-slate-700` | `#334155` | 模块悬停态、次级按钮悬停态 |

### 2.2 品牌与强调色 (Primary / Accent)
用于主按钮、进度条、强调图标。

| 变量名 | Tailwind 类 | 颜色值 | 用途 |
| --- | --- | --- | --- |
| `primary-main` | `bg-indigo-600` | `#4f46e5` | 主按钮背景 |
| `primary-hover` | `bg-indigo-500` | `#6366f1` | 主按钮悬停、焦点环 (Focus Ring) |
| `primary-text` | `text-indigo-400` | `#818cf8` | 强调文字、链接、高亮图标 |
| `primary-light` | `text-indigo-300` | `#a5b4fc` | 次强调文字 |

### 2.3 文本颜色 (Typography Colors)

| 变量名 | Tailwind 类 | 颜色值 | 用途 |
| --- | --- | --- | --- |
| `text-primary` | `text-slate-100` | `#f1f5f9` | 大标题、核心数据、强调用语 |
| `text-secondary` | `text-slate-300` | `#cbd5e1` | 常规正文、列表项 |
| `text-tertiary` | `text-slate-400` | `#94a3b8` | 辅助说明、次要信息、时间戳 |
| `text-muted` | `text-slate-500` | `#64748b` | 占位符、极其次要的提示 |

### 2.4 语义色 (Semantic Colors)

| 语义 | Tailwind 类 | 用途 |
| --- | --- | --- |
| **危险/阻断 (Danger)** | `rose-500` / `rose-400` | 阻断提示、删除按钮、熬夜代价 |
| **安全/收益 (Success)** | `emerald-500` / `emerald-400` | 睡眠好处、未限制状态 |
| **警告/提醒 (Warning)** | `amber-500` / `amber-400` | 临近睡眠时间的提醒 |

---

## 3. 排版系统 (Typography)

字体栈优先使用系统默认的无衬线字体，确保在不同操作系统上的清晰度和加载速度。

**Font Family:**
`"Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`

### 3.1 层级规范

| 级别 | Tailwind 类 | 适用场景 |
| --- | --- | --- |
| **Display** | `text-4xl font-bold tracking-tight` | 阻断页核心大标题（如：“现在是晚安时间”） |
| **H1** | `text-2xl font-bold` | 设置页各模块主标题（如：“睡眠计划”） |
| **H2** | `text-lg font-semibold` | 卡片标题、Popup 状态标题 |
| **Body Large** | `text-base font-medium` | 重要的正文、大按钮文字 |
| **Body Regular** | `text-sm font-normal` | 默认正文、表单输入框、列表文字 |
| **Caption** | `text-xs text-slate-400` | 辅助说明、标签、徽章文字 |

---

## 4. 空间与布局 (Spacing & Layout)

采用基于 `4px` 的网格系统。

### 4.1 圆角 (Border Radius)
为了传达“温和、安全”的感觉，我们大量使用较大的圆角。

- **小组件 (徽章、复选框):** `rounded-md` (6px)
- **中组件 (输入框、普通按钮):** `rounded-lg` (8px)
- **大组件 (卡片、大按钮):** `rounded-xl` (12px)
- **容器 (Popup、设置页外框):** `rounded-2xl` (16px)

### 4.2 边框 (Borders)
在暗色模式下，使用细边框来区分层级，而不是强烈的阴影。
- 默认边框：`border border-slate-700` 或 `border-slate-800`

---

## 5. 核心组件 (Components)

### 5.1 按钮 (Buttons)

1. **主按钮 (Primary Action)**
   - 目标：引导用户去睡觉、保存设置。
   - 样式：`bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 font-medium transition-colors`
2. **次按钮 (Secondary Action)**
   - 目标：取消、返回。
   - 样式：`bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-4 py-2 font-medium border border-slate-700`
3. **幽灵按钮 / 危险操作 (Ghost / Destructive)**
   - 目标：临时解锁、删除规则（需要增加摩擦力）。
   - 样式：`text-slate-500 hover:text-slate-300` 或 `text-rose-400 hover:bg-rose-600/10`

### 5.2 输入框与表单 (Inputs & Forms)

- **默认状态:** `bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3`
- **聚焦状态 (Focus):** 必须有清晰的焦点环 `focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`

### 5.3 卡片 (Cards)

用于包裹设置项或数据统计。
- 样式：`bg-slate-800/50 border border-slate-700 rounded-xl p-6`

---

## 6. 图标系统 (Iconography)

统一使用 **Lucide Icons**。
- **风格:** 线性、圆角、2px 描边 (Stroke width 2)。
- **尺寸:**
  - 装饰性大图标：`w-16 h-16` (如阻断页的月亮)
  - 模块图标：`w-8 h-8` 或 `w-6 h-6`
  - 按钮/列表内联图标：`w-4 h-4` 或 `w-5 h-5`

---

## 7. 动效与交互 (Motion & Interaction)

动效的目的是**安抚**，绝对避免闪烁、弹跳或过于活泼的动画。

1. **页面切换与出现 (Fade & Slide)**
   - 使用缓慢的淡入：`animate-in fade-in duration-500`
   - 轻微的向上滑入：`slide-in-from-bottom-4`
2. **倒计时与提示 (Pulse)**
   - 临时解锁的冷静期，使用缓慢的呼吸灯效果：`animate-pulse`
3. **悬停反馈 (Hover Transitions)**
   - 所有可点击元素必须有颜色过渡：`transition-colors duration-200`
4. **焦点反馈 (Focus)**
   - 键盘导航时，必须有明显的 `focus-visible` 状态，确保无障碍访问。

---

## 8. 场景规范示例 (Contextual Guidelines)

### 8.1 阻断页 (Block Page) 规范
- **必须全屏**，背景深邃，可带有极其微弱的渐变光晕（如 `bg-indigo-900/20 blur-3xl`）以打破纯黑的死板。
- **视觉重心**必须是“去睡觉”的按钮。
- “临时解锁”按钮必须在视觉上被弱化（文字按钮，无背景色）。

### 8.2 Popup 弹窗规范
- 尺寸固定（建议 `w-80`，即 320px 宽）。
- 信息层级：时间状态 > 今日数据 > 当前网站操作 > 底部快捷链接。
- 不要在 Popup 中放入复杂的表单，复杂操作一律引导至 Options 页。

### 8.3 文案语气 (Voice & Tone)
- ❌ **错误 (爹味/恐吓):** “你还在熬夜？你想猝死吗？立刻关掉网页！”
- ✅ **正确 (温和/理性):** “现在是晚安时间。继续浏览可能会让你明天早晨起床非常困难。建议现在关掉屏幕，去洗漱。”

---

## 9. 开发者指南 (Developer Guide)

本项目 UI 基于 **React + Tailwind CSS** 构建。

**Tailwind 配置建议 (`tailwind.config.js`):**
确保启用了暗色模式支持，并扩展了默认的字体栈。

```javascript
module.exports = {
  darkMode: 'class', // 强制暗色模式可设为 'class' 并在 html 注入 'dark'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // 可在此处覆盖或扩展色板
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'), // 强烈建议引入此插件处理进场动效
  ],
}
```