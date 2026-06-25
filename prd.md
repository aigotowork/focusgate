# 浏览器插件版「睡眠提醒与网页阻断工具」PRD

> 产品暂定名：**晚安边界 / GoodNight Guard**  
> 产品形态：**Chrome / Edge 浏览器插件**  
> 文档版本：**v1.0**  
> 目标平台：**Chrome、Microsoft Edge，后续可扩展 Firefox**  
> 核心目标：**帮助用户在设定睡觉时间后，减少继续浏览高刺激网站的行为，通过提醒、阻断、跳转、解锁摩擦和数据反馈，降低熬夜刷网页的概率。**

---

# 1. 项目背景

## 1.1 背景说明

很多用户晚上并不是不知道应该睡觉，而是很难停止当前的线上娱乐行为，例如：

- 刷 B 站、YouTube、抖音网页版；
- 看小说、漫画、论坛；
- 逛 Reddit、X、知乎、小红书；
- 看新闻、购物、直播；
- 不断打开新的标签页寻找刺激内容。

系统自带的闹钟、日历提醒或浏览器书签管理无法有效解决这个问题，因为它们通常只是提醒，不具备足够的行为阻断能力。

浏览器插件可以在用户访问指定网站时进行检测，并在到达睡觉时间后自动执行：

- 弹窗提醒；
- 页面遮罩；
- 跳转到晚安页面；
- 阻止继续访问；
- 临时解锁；
- 记录阻断次数。

因此，浏览器插件是该产品最适合作为 MVP 的切入点。

---

## 1.2 问题定义

用户晚上熬夜刷网页的核心问题包括：

| 问题 | 说明 |
|---|---|
| 提醒太弱 | 普通闹钟容易被关闭或忽略 |
| 自控力下降 | 睡前意志力低，容易“再看 5 分钟” |
| 内容无限流 | 推荐流、视频、社交、论坛天然延长使用时间 |
| 没有边界感 | 用户缺少明确的“今晚到此为止”的机制 |
| 破例太容易 | 即使设置了规则，也容易随手关掉 |
| 缺少反馈 | 用户不知道自己每晚被哪些网站拖住 |

---

## 1.3 产品机会

浏览器插件可提供比普通提醒更有效的网页级干预：

1. **可精准识别当前网站**
2. **可在访问时即时阻断**
3. **可跳转到睡眠提醒页**
4. **可设置临时解锁，但增加心理成本**
5. **可记录用户被阻断行为**
6. **开发成本相对低，适合快速验证需求**

---

# 2. 产品定位

## 2.1 一句话定位

**一个帮你到点停止刷网页、准时睡觉的浏览器插件。**

---

## 2.2 产品核心价值

> 用户在清醒时设定睡眠边界，插件在晚上意志力较低时帮助用户执行这个边界。

---

## 2.3 产品关键词

- 睡眠提醒
- 网站阻断
- 数字宵禁
- 晚安模式
- 反熬夜
- 临时解锁
- 睡前自律
- 浏览器插件

---

# 3. 产品目标

## 3.1 MVP 目标

第一版产品要验证：

1. 用户是否愿意主动设置睡觉时间；
2. 用户是否愿意添加要限制的网站；
3. 到点阻断网站是否真的能减少继续浏览；
4. 临时解锁机制是否能在不强迫用户的情况下增加摩擦；
5. 用户是否愿意长期保留插件。

---

## 3.2 产品目标

| 目标 | 说明 |
|---|---|
| 降低用户睡后继续浏览娱乐网站的概率 | 到点后阻断黑名单网站 |
| 建立用户睡前边界感 | 睡前提醒 + 晚安页面 |
| 提高继续浏览的心理成本 | 临时解锁、确认语、冷静期 |
| 提供正向反馈 | 每日/每周阻断统计 |
| 保持温和可控 | 用户可以临时解锁，避免强制过度导致卸载 |

---

## 3.3 非目标

第一版不解决：

| 非目标 | 说明 |
|---|---|
| 不控制手机 App | 仅浏览器插件 |
| 不控制电脑本地应用 | 例如 Steam、游戏、播放器等 |
| 不防止用户卸载插件 | 普通插件无法做到 |
| 不防止用户换浏览器 | 只能作用于安装插件的浏览器 |
| 不记录详细浏览内容 | 优先保护隐私，只记录域名和事件 |
| 不精确判断用户是否入睡 | 只根据浏览器行为推断 |

---

# 4. 目标用户

## 4.1 核心用户

| 用户类型 | 特征 | 典型问题 |
|---|---|---|
| 熬夜刷网页用户 | 晚上经常刷视频/论坛/小说 | 明知该睡但停不下来 |
| 学生 / 备考人群 | 作息目标明确 | 被 B 站、知乎、小说站拖住 |
| 程序员 / 知识工作者 | 长时间使用浏览器 | 从查资料变成娱乐浏览 |
| 内容消费者 | 习惯睡前看视频、文章、社区 | 信息流无尽，难以结束 |
| 自律工具爱好者 | 愿意尝试工具改善习惯 | 需要可配置的约束工具 |

---

## 4.2 用户画像

### 用户 A：大学生

- 晚上计划 23:30 睡觉；
- 实际经常 01:30 还在 B 站；
- 尝试过闹钟，但经常关掉；
- 希望有一个工具能到点挡住娱乐网站。

### 用户 B：上班族

- 白天工作压力大；
- 晚上报复性刷 YouTube、Reddit；
- 第二天精神差；
- 希望工具不要太强制，但能提醒自己停下。

### 用户 C：备考用户

- 想保持规律作息；
- 晚上容易打开知乎、微博、小说站；
- 希望有严格模式，减少破例。

---

# 5. 使用场景

## 5.1 场景一：睡前提醒

用户晚上 22:30 正在浏览 YouTube。插件弹出提示：

> 距离睡眠模式还有 30 分钟，可以开始收尾了。

---

## 5.2 场景二：到点阻断

用户 23:00 后打开 B 站，页面被跳转至晚安页面：

> 你已进入睡眠模式。  
> 这是白天的你为今晚设置的边界。

---

## 5.3 场景三：临时解锁

用户确实想再看 10 分钟，点击“临时解锁”。

插件要求：

1. 等待 30 秒；
2. 输入确认语；
3. 选择解锁原因；
4. 解锁 10 分钟。

---

## 5.4 场景四：解锁结束

10 分钟后用户仍在黑名单网站，插件重新阻断：

> 临时解锁已结束，现在该休息了。

---

## 5.5 场景五：次日查看统计

用户第二天打开插件，看到：

- 昨晚阻断 5 次；
- 临时解锁 2 次；
- 最常访问：youtube.com；
- 比前一天少熬夜 20 分钟。

---

# 6. 产品范围

## 6.1 MVP 范围

第一版必须包含：

| 模块 | 功能 |
|---|---|
| 初始设置 | 睡觉时间、提醒时间、黑名单网站 |
| 阻断规则 | 到点拦截黑名单网站 |
| 晚安页面 | 展示睡眠提醒、阻断原因、操作按钮 |
| 临时解锁 | 解锁指定网站一段时间 |
| 数据记录 | 记录阻断次数、解锁次数、访问域名 |
| 插件弹窗 | 查看状态、开启/暂停睡眠模式 |
| 设置页面 | 管理时间、网站、强度、文案 |
| 本地存储 | 所有数据优先本地保存 |

---

## 6.2 后续版本范围

| 版本 | 功能 |
|---|---|
| v1.1 | 周报、个性化提醒语、网站类别模板 |
| v1.2 | 工作日/周末不同规则、白名单、严格模式 |
| v1.3 | 账号登录、云同步、多设备同步 |
| v1.4 | AI 个性化晚安文案、习惯建议 |
| v2.0 | 桌面客户端联动 |

---

# 7. 产品结构

## 7.1 信息架构

```text
浏览器插件
├─ Popup 弹窗首页
│  ├─ 当前状态
│  ├─ 距离睡眠模式时间
│  ├─ 今日阻断次数
│  ├─ 今日解锁次数
│  ├─ 快速暂停
│  └─ 进入设置
│
├─ 设置页 Options
│  ├─ 睡眠计划
│  │  ├─ 睡觉时间
│  │  ├─ 睡前提醒时间
│  │  ├─ 起床时间
│  │  └─ 工作日/周末设置
│  │
│  ├─ 网站规则
│  │  ├─ 黑名单网站
│  │  ├─ 网站类别模板
│  │  ├─ 临时允许列表
│  │  └─ 忽略子域名设置
│  │
│  ├─ 阻断强度
│  │  ├─ 温和模式
│  │  ├─ 标准模式
│  │  └─ 严格模式
│  │
│  ├─ 解锁设置
│  │  ├─ 每次解锁时长
│  │  ├─ 每晚解锁次数
│  │  ├─ 是否需要确认语
│  │  ├─ 是否需要冷静期
│  │  └─ 是否记录原因
│  │
│  ├─ 晚安页面
│  │  ├─ 个性化提醒语
│  │  ├─ 睡眠好处内容
│  │  ├─ 熬夜代价内容
│  │  └─ 睡前行动建议
│  │
│  ├─ 数据统计
│  │  ├─ 今日统计
│  │  ├─ 近 7 天统计
│  │  ├─ 最常被阻断网站
│  │  └─ 解锁原因统计
│  │
│  └─ 隐私与数据
│     ├─ 本地数据说明
│     ├─ 导出数据
│     ├─ 清空数据
│     └─ 隐私模式
│
├─ 阻断页 Block Page
│  ├─ 晚安提醒
│  ├─ 被阻断网站
│  ├─ 当前时间
│  ├─ 用户自定义承诺语
│  ├─ 睡前建议
│  ├─ 临时解锁
│  └─ 返回安全页面
│
└─ 后台服务 Service Worker
   ├─ 时间判断
   ├─ 规则判断
   ├─ 标签页监听
   ├─ 重定向处理
   ├─ 通知提醒
   ├─ 解锁状态管理
   └─ 数据记录
```

---

# 8. 核心功能需求

---

# 8.1 初次引导 Onboarding

## 8.1.1 功能描述

用户安装插件后，自动打开初次设置页面，引导用户完成最小配置。

---

## 8.1.2 引导步骤

| 步骤 | 页面内容 | 用户操作 |
|---|---|---|
| Step 1 | 欢迎页，说明产品用途 | 点击开始 |
| Step 2 | 设置睡觉时间 | 选择时间 |
| Step 3 | 设置睡前提醒 | 选择提前 15/30/60 分钟 |
| Step 4 | 选择要限制的网站类别 | 勾选视频/社交/小说等 |
| Step 5 | 确认黑名单 | 可编辑域名 |
| Step 6 | 选择阻断强度 | 温和/标准/严格 |
| Step 7 | 设置一句提醒自己的话 | 输入个性化承诺 |
| Step 8 | 完成并开启插件 | 进入首页 |

---

## 8.1.3 默认配置

| 配置项 | 默认值 |
|---|---|
| 睡觉时间 | 23:30 |
| 睡前提醒 | 提前 30 分钟 |
| 起床时间 | 07:00 |
| 阻断模式 | 标准模式 |
| 解锁时长 | 10 分钟 |
| 每晚解锁次数 | 3 次 |
| 冷静期 | 30 秒 |
| 是否记录原因 | 是 |
| 是否启用通知 | 是 |

---

# 8.2 睡眠计划

## 8.2.1 功能描述

用户可以设置每天的睡眠模式开启时间。

---

## 8.2.2 字段设计

| 字段 | 类型 | 必填 | 示例 | 说明 |
|---|---|---:|---|---|
| bedtime | Time | 是 | 23:30 | 正式进入睡眠模式时间 |
| wakeTime | Time | 是 | 07:00 | 睡眠模式结束时间 |
| reminderMinutes | Number | 是 | 30 | 提前提醒分钟数 |
| enabledDays | Array | 是 | Mon-Fri | 生效日期 |
| weekendBedtime | Time | 否 | 00:30 | 周末睡觉时间 |
| weekendWakeTime | Time | 否 | 08:30 | 周末起床时间 |

---

## 8.2.3 睡眠时段判断逻辑

需要支持跨天时间，例如：

- 睡觉时间：23:30
- 起床时间：07:00

则睡眠模式区间为：

```text
当天 23:30 至次日 07:00
```

判断逻辑：

```text
如果 bedtime < wakeTime：
  睡眠模式 = 当前时间 >= bedtime 且 当前时间 < wakeTime

如果 bedtime > wakeTime：
  睡眠模式 = 当前时间 >= bedtime 或 当前时间 < wakeTime
```

---

## 8.2.4 提醒时段

例如：

- bedtime：23:30
- reminderMinutes：30

则提醒开始时间为：

```text
23:00
```

提醒期：

```text
23:00 - 23:30
```

提醒期内：

- 可弹出通知；
- 可在黑名单网站显示顶部提示条；
- 不阻断访问，除非用户开启严格预阻断。

---

# 8.3 网站黑名单

## 8.3.1 功能描述

用户可以配置需要在睡眠模式中阻断的网站域名。

---

## 8.3.2 黑名单规则类型

| 类型 | 示例 | 匹配说明 |
|---|---|---|
| 主域名 | youtube.com | 匹配 youtube.com 及子域名 |
| 子域名 | m.youtube.com | 仅匹配指定子域 |
| 通配符 | *.reddit.com | 匹配所有 reddit 子域 |
| URL 关键字 | /shorts | 可选，v1 可不做 |
| 类别模板 | 视频网站 | 内置一组域名 |

---

## 8.3.3 内置类别模板

| 类别 | 默认域名示例 |
|---|---|
| 视频 | youtube.com、bilibili.com、netflix.com、iqiyi.com、youku.com、twitch.tv |
| 社交 | x.com、twitter.com、reddit.com、facebook.com、instagram.com、weibo.com |
| 短内容 | tiktok.com、douyin.com、kuaishou.com |
| 小说/漫画 | qidian.com、jjwxc.net、fanqienovel.com、webtoons.com |
| 新闻资讯 | zhihu.com、news.google.com、toutiao.com |
| 购物 | taobao.com、jd.com、amazon.com、pinduoduo.com |
| 游戏社区 | steamcommunity.com、ign.com、gamespot.com |

> 注意：默认模板必须允许用户编辑，不应强制固定。

---

## 8.3.4 匹配规则

域名标准化规则：

1. 转小写；
2. 去掉协议：`https://`、`http://`；
3. 去掉路径；
4. 去掉末尾 `/`；
5. 将 `www.` 视为可选；
6. 支持子域名匹配。

示例：

```text
用户添加：youtube.com

应该匹配：
youtube.com
www.youtube.com
m.youtube.com
music.youtube.com

不应该匹配：
notyoutube.com
youtube.com.fake-site.com
```

---

# 8.4 网站阻断

## 8.4.1 功能描述

当用户在睡眠模式中访问黑名单网站时，插件应阻止访问，并展示阻断页面。

---

## 8.4.2 触发条件

满足以下条件时触发阻断：

| 条件 | 说明 |
|---|---|
| 插件启用 | 用户未全局暂停 |
| 当前处于睡眠模式 | 当前时间在睡眠时段内 |
| 当前域名命中黑名单 | 根据规则匹配 |
| 当前网站未处于临时解锁状态 | 解锁未过期则允许 |
| 当前页面不是插件自身页面 | 避免循环跳转 |

---

## 8.4.3 阻断动作

v1 推荐使用：

```text
重定向到插件内置阻断页
```

例如：

```text
chrome-extension://extension-id/block.html?url=https%3A%2F%2Fyoutube.com
```

可选能力：

| 动作 | v1 是否做 | 说明 |
|---|---:|---|
| 重定向阻断页 | 是 | 核心能力 |
| 页面遮罩 | 可选 | Content Script 实现 |
| 关闭标签页 | 否 | 过强，容易误伤 |
| 静默失败 | 否 | 用户体验差 |
| 返回上一个页面 | 可选 | 阻断页按钮实现 |

---

## 8.4.4 阻断页内容

阻断页应包含：

- 当前被阻断的网站；
- 当前时间；
- 用户设置的睡觉时间；
- 个性化提醒语；
- 睡眠好处；
- 熬夜代价；
- 下一步建议；
- 临时解锁按钮；
- 返回安全页面按钮；
- 进入设置按钮。

---

## 8.4.5 阻断页文案示例

```text
现在是 23:48，你已经进入晚安模式。

你刚刚尝试访问：
youtube.com

这是白天的你为今晚设置的边界：
“我想明天精神更好，所以今晚到点就休息。”

继续看 10 分钟很容易变成 1 小时。
现在最好的选择是：关掉屏幕，去洗漱，准备睡觉。
```

---

# 8.5 睡前提醒

## 8.5.1 功能描述

在正式睡眠模式开始前，插件提醒用户即将进入限制状态。

---

## 8.5.2 提醒方式

| 方式 | v1 是否做 | 说明 |
|---|---:|---|
| 浏览器通知 | 是 | 使用 chrome.notifications |
| 黑名单网站顶部提示条 | 可选 | 使用 Content Script |
| Popup 状态倒计时 | 是 | 用户点击插件图标可见 |
| Badge 倒计时 | 可选 | 图标角标显示剩余分钟 |

---

## 8.5.3 通知触发规则

默认只触发一次：

```text
睡前提醒开始时触发
```

例如：

- 睡觉时间 23:30；
- 提前 30 分钟提醒；
- 23:00 触发通知。

通知文案：

```text
距离晚安模式还有 30 分钟
可以开始收尾当前网页了。
```

---

## 8.5.4 防骚扰规则

| 规则 | 说明 |
|---|---|
| 每晚提醒最多一次 | 避免通知轰炸 |
| 用户可关闭通知 | 尊重用户 |
| 用户正在非黑名单网站时只发通知 | 不打扰正常工作 |
| 若浏览器未开启，错过提醒不补发 | 简化实现 |

---

# 8.6 临时解锁

## 8.6.1 功能描述

用户在被阻断时，可以申请临时解锁当前网站。

---

## 8.6.2 解锁流程

标准模式下：

```text
点击临时解锁
↓
显示冷静倒计时 30 秒
↓
输入确认语
↓
选择解锁原因
↓
解锁当前网站 10 分钟
↓
自动跳转回原网站
```

---

## 8.6.3 解锁范围

v1 推荐：

| 解锁范围 | 是否支持 | 说明 |
|---|---:|---|
| 当前域名 | 是 | 推荐默认 |
| 当前完整 URL | 否 | 太细，用户体验差 |
| 全部黑名单网站 | 可选 | 严格模式不允许 |
| 本次标签页 | 可选 | 实现稍复杂 |
| 全局暂停插件 | 是，但隐藏较深 | 防止误伤，但不能太显眼 |

---

## 8.6.4 解锁字段

| 字段 | 示例 | 说明 |
|---|---|---|
| domain | youtube.com | 解锁域名 |
| unlockedAt | 2026-06-26T23:45:00 | 解锁时间 |
| expiresAt | 2026-06-26T23:55:00 | 过期时间 |
| durationMinutes | 10 | 解锁时长 |
| reason | 工作需要 | 解锁原因 |
| mode | standard | 当前阻断模式 |

---

## 8.6.5 解锁原因

默认选项：

- 工作 / 学习需要；
- 联系别人；
- 放松一下；
- 情绪不好；
- 就想继续看；
- 其他。

---

## 8.6.6 确认语

默认确认语：

```text
我知道现在继续浏览可能会影响睡眠，但我选择临时解锁 10 分钟。
```

用户需要完整输入，或点击复制后手动确认。

严格模式下必须输入；温和模式下可不输入。

---

## 8.6.7 解锁次数限制

| 模式 | 每晚解锁次数 | 每次时长 | 是否冷静期 | 是否确认语 |
|---|---:|---:|---:|---:|
| 温和模式 | 不限 | 15 分钟 | 否 | 否 |
| 标准模式 | 3 次 | 10 分钟 | 30 秒 | 是 |
| 严格模式 | 1 次 | 5 分钟 | 60 秒 | 是 |

---

# 8.7 阻断强度模式

## 8.7.1 温和模式

适合新用户。

| 行为 | 规则 |
|---|---|
| 睡前提醒 | 是 |
| 到点阻断 | 是 |
| 临时解锁 | 不限次数 |
| 冷静期 | 无 |
| 确认语 | 无 |
| 强制程度 | 低 |

---

## 8.7.2 标准模式

默认模式。

| 行为 | 规则 |
|---|---|
| 睡前提醒 | 是 |
| 到点阻断 | 是 |
| 临时解锁 | 每晚 3 次 |
| 解锁时长 | 10 分钟 |
| 冷静期 | 30 秒 |
| 确认语 | 是 |
| 强制程度 | 中 |

---

## 8.7.3 严格模式

适合强自律用户。

| 行为 | 规则 |
|---|---|
| 睡前提醒 | 是 |
| 到点阻断 | 是 |
| 临时解锁 | 每晚 1 次 |
| 解锁时长 | 5 分钟 |
| 冷静期 | 60 秒 |
| 确认语 | 是 |
| 全局暂停 | 需要到设置页 |
| 强制程度 | 较高 |

---

# 8.8 暂停机制

## 8.8.1 功能描述

用户可以临时暂停插件，避免特殊情况误伤。

---

## 8.8.2 暂停类型

| 类型 | 时长 | 入口 |
|---|---:|---|
| 暂停 15 分钟 | 15 分钟 | Popup |
| 暂停 1 小时 | 60 分钟 | Popup |
| 今晚暂停 | 到 wakeTime | 设置页或 Popup 二级入口 |
| 永久关闭 | 无限制 | 设置页 |

---

## 8.8.3 暂停限制

严格模式下：

- Popup 只显示暂停 15 分钟；
- 今晚暂停需要进入设置页；
- 永久关闭需要输入确认语。

---

# 8.9 数据统计

## 8.9.1 功能描述

记录用户夜间被阻断与解锁行为，帮助用户复盘。

---

## 8.9.2 v1 记录事件

| 事件 | 字段 |
|---|---|
| block_triggered | 时间、域名、URL hash、模式 |
| unlock_requested | 时间、域名 |
| unlock_granted | 时间、域名、时长、原因 |
| unlock_expired | 时间、域名 |
| reminder_sent | 时间 |
| pause_enabled | 时间、时长 |
| settings_changed | 时间、变更项 |

---

## 8.9.3 隐私原则

v1 建议：

| 数据 | 是否记录 | 说明 |
|---|---:|---|
| 域名 | 是 | 如 youtube.com |
| 完整 URL | 默认否 | 可选开启，仅本地 |
| 页面标题 | 否 | 隐私风险较高 |
| 页面内容 | 否 | 不采集 |
| 输入内容 | 否 | 不采集 |
| 用户账号信息 | 否 | 无云同步时不需要 |

---

## 8.9.4 统计展示

Popup 首页：

- 今日阻断次数；
- 今日解锁次数；
- 当前是否处于晚安模式。

设置页统计：

- 最近 7 天阻断次数；
- 最近 7 天解锁次数；
- 最常被阻断域名；
- 解锁原因分布；
- 最晚一次阻断时间。

---

# 8.10 晚安页面内容

## 8.10.1 页面目标

不是恐吓用户，而是让用户产生：

1. 暂停当前行为；
2. 重新意识到睡眠目标；
3. 接受停止浏览；
4. 知道下一步做什么。

---

## 8.10.2 内容结构

```text
标题：
现在是晚安时间

被阻断信息：
你正在尝试访问 youtube.com

个人承诺：
“明天早上的我，会感谢现在睡觉的我。”

睡眠收益：
- 明天更清醒
- 情绪更稳定
- 注意力更好

熬夜代价：
- 起床更困难
- 工作/学习效率下降
- 更容易焦虑和拖延

建议行动：
1. 关掉这个标签页
2. 去洗漱
3. 把设备放远
4. 做 1 分钟深呼吸

按钮：
- 我去睡了
- 临时解锁
- 修改设置
```

---

# 9. 页面设计需求

---

# 9.1 Popup 弹窗

## 9.1.1 功能定位

用户点击浏览器插件图标后看到的轻量控制面板。

---

## 9.1.2 页面内容

| 区域 | 内容 |
|---|---|
| 状态区 | 当前是否处于睡眠模式 |
| 倒计时区 | 距离睡眠模式还有多久 / 距离结束还有多久 |
| 今日数据 | 阻断次数、解锁次数 |
| 快捷操作 | 暂停 15 分钟、进入设置 |
| 当前网站状态 | 当前网站是否在黑名单 |
| 引导 | 添加当前网站到黑名单 |

---

## 9.1.3 Popup 状态示例

### 未到睡眠时间

```text
晚安模式未开启
距离开始还有 1 小时 24 分钟

今晚睡觉时间：23:30
今日阻断：0 次
```

### 已进入睡眠时间

```text
晚安模式进行中
将在 07:00 结束

今晚已阻断：3 次
临时解锁：1 次
```

### 当前网站在黑名单中

```text
当前网站：youtube.com
已加入睡眠阻断列表
```

### 当前网站未在黑名单

```text
当前网站：example.com
[加入黑名单]
```

---

# 9.2 设置页 Options

## 9.2.1 页面结构

建议使用左侧导航：

```text
睡眠计划
网站规则
阻断强度
解锁设置
晚安页面
数据统计
隐私与数据
关于
```

---

## 9.2.2 睡眠计划页面

字段：

- 晚安模式开启时间；
- 晚安模式结束时间；
- 提前提醒时间；
- 生效星期；
- 周末单独设置；
- 测试通知按钮。

---

## 9.2.3 网站规则页面

功能：

- 添加域名；
- 删除域名；
- 编辑域名；
- 从模板导入；
- 一键添加当前网站；
- 搜索黑名单；
- 导入/导出规则。

---

## 9.2.4 阻断强度页面

功能：

- 模式选择；
- 展示每种模式差异；
- 自定义高级规则。

---

## 9.2.5 解锁设置页面

字段：

- 解锁时长；
- 每晚解锁次数；
- 是否需要冷静期；
- 冷静期秒数；
- 是否需要输入确认语；
- 自定义确认语；
- 是否记录解锁原因。

---

## 9.2.6 晚安页面设置

字段：

- 自定义提醒语；
- 是否显示睡眠好处；
- 是否显示熬夜代价；
- 是否显示行动建议；
- 自定义行动建议；
- 页面主题。

---

## 9.2.7 数据统计页面

展示：

- 今日；
- 最近 7 天；
- 最近 30 天；
- 域名排行榜；
- 解锁原因图表；
- 数据导出。

---

# 9.3 阻断页 Block Page

## 9.3.1 URL 参数

```text
block.html?url={encodedUrl}&domain={domain}&reason=sleep_mode
```

---

## 9.3.2 主要按钮

| 按钮 | 行为 |
|---|---|
| 我去睡了 | 关闭当前标签页或跳转到新标签页 |
| 临时解锁 | 打开解锁流程 |
| 返回上一页 | history.back 或跳转空白页 |
| 修改设置 | 打开 Options 页面 |

---

## 9.3.3 临时解锁弹窗

内容：

1. 提示风险；
2. 倒计时；
3. 输入确认语；
4. 选择原因；
5. 确认解锁。

---

# 10. 技术方案设计

---

# 10.1 技术选型

## 10.1.1 插件规范

建议使用：

```text
Chrome Extension Manifest V3
```

原因：

- Chrome / Edge 主流支持；
- 更符合未来浏览器政策；
- 发布要求明确。

---

## 10.1.2 前端技术

推荐：

| 模块 | 技术 |
|---|---|
| Popup / Options / Block Page | React + TypeScript |
| 样式 | Tailwind CSS 或普通 CSS |
| 构建 | Vite |
| 状态管理 | 轻量本地状态，不必引入复杂库 |
| 存储 | chrome.storage.local |
| 定时 | chrome.alarms |
| 标签页监听 | chrome.tabs |
| 请求拦截 | chrome.declarativeNetRequest 或 tabs 更新监听 |

---

## 10.1.3 插件模块

```text
extension/
├─ manifest.json
├─ background/
│  └─ service-worker.ts
├─ popup/
│  ├─ popup.html
│  └─ popup.tsx
├─ options/
│  ├─ options.html
│  └─ options.tsx
├─ block/
│  ├─ block.html
│  └─ block.tsx
├─ content/
│  └─ reminder-banner.ts
├─ shared/
│  ├─ types.ts
│  ├─ storage.ts
│  ├─ time.ts
│  ├─ domain.ts
│  ├─ rules.ts
│  └─ events.ts
└─ assets/
```

---

# 10.2 Manifest 权限设计

## 10.2.1 所需权限

```json
{
  "permissions": [
    "storage",
    "tabs",
    "alarms",
    "notifications",
    "declarativeNetRequest",
    "declarativeNetRequestWithHostAccess"
  ],
  "host_permissions": [
    "<all_urls>"
  ]
}
```

---

## 10.2.2 权限说明

| 权限 | 用途 | 是否必要 |
|---|---|---:|
| storage | 保存设置和事件 | 必要 |
| tabs | 获取当前标签页 URL、跳转阻断页 | 必要 |
| alarms | 定时提醒和状态刷新 | 必要 |
| notifications | 睡前系统通知 | 推荐 |
| declarativeNetRequest | 拦截/重定向网站请求 | 推荐 |
| host_permissions | 访问 URL 做域名判断 | 必要 |
| scripting | 注入提醒条 | 可选 |
| activeTab | 添加当前网站 | 可选 |

---

## 10.2.3 权限最小化建议

MVP 如果担心上架审核或用户信任问题，可以先不用 `declarativeNetRequest`，改为：

- 监听 `tabs.onUpdated`
- 判断 URL 后执行 `tabs.update` 跳转到阻断页

优点：

- 实现简单；
- 不涉及复杂动态规则。

缺点：

- 页面可能短暂加载；
- 拦截体验不如 DNR 稳定。

---

# 10.3 阻断实现方案

有两种方案。

---

## 10.3.1 方案 A：tabs.onUpdated 监听跳转

### 原理

监听标签页 URL 变化，当发现命中黑名单且当前处于睡眠模式，则将该标签页跳转到插件阻断页。

### 伪代码

```typescript
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url && !tab.url) return;

  const url = changeInfo.url || tab.url;
  const decision = await shouldBlock(url);

  if (decision.block) {
    const blockUrl = chrome.runtime.getURL(
      `block/block.html?url=${encodeURIComponent(url)}&domain=${decision.domain}`
    );

    await chrome.tabs.update(tabId, { url: blockUrl });
    await recordEvent("block_triggered", {
      domain: decision.domain,
      originalUrlHash: hashUrl(url),
      timestamp: Date.now()
    });
  }
});
```

### 优点

| 优点 |
|---|
| 实现简单 |
| 规则灵活 |
| 易于调试 |
| 适合 MVP |

### 缺点

| 缺点 |
|---|
| 网站可能先闪一下 |
| 某些重定向场景可能重复触发 |
| 需要处理循环跳转 |
| 不是真正请求级阻断 |

---

## 10.3.2 方案 B：declarativeNetRequest 动态规则

### 原理

根据黑名单动态生成 DNR 规则，在睡眠模式开启时启用规则，将匹配网站重定向到阻断页。

### 优点

| 优点 |
|---|
| 拦截更早 |
| 性能更好 |
| 不依赖 Service Worker 长期活跃 |
| 更接近浏览器原生阻断 |

### 缺点

| 缺点 |
|---|
| 动态规则管理复杂 |
| 规则数量有限制 |
| 临时解锁需要动态更新规则 |
| 对复杂域名匹配处理麻烦 |
| 开发成本高于方案 A |

---

## 10.3.3 推荐方案

v1 推荐：

```text
优先使用方案 A：tabs.onUpdated
```

原因：

- MVP 阶段更快；
- 黑名单数量不会太大；
- 解锁逻辑更灵活；
- 后续可演进到 DNR。

v1.2 后可考虑：

```text
方案 A + 方案 B 混合
```

即：

- 常规阻断使用 DNR；
- 临时解锁和复杂逻辑由 background 补充处理。

---

# 10.4 时间判断模块

## 10.4.1 函数设计

```typescript
interface SleepSchedule {
  bedtime: string;       // "23:30"
  wakeTime: string;      // "07:00"
  reminderMinutes: number;
  enabledDays: number[]; // 0-6
}

function isInSleepMode(now: Date, schedule: SleepSchedule): boolean;

function isInReminderWindow(now: Date, schedule: SleepSchedule): boolean;

function getNextBedtime(now: Date, schedule: SleepSchedule): Date;

function getSleepSessionId(now: Date, schedule: SleepSchedule): string;
```

---

## 10.4.2 Sleep Session ID

为了统计“今晚”，需要定义 sleepSessionId。

例如：

```text
2026-06-26_23:30
```

如果当前时间是 2026-06-27 01:00，仍归属于：

```text
2026-06-26_23:30
```

而不是 2026-06-27。

---

# 10.5 域名匹配模块

## 10.5.1 数据结构

```typescript
interface SiteRule {
  id: string;
  domain: string;
  matchSubdomains: boolean;
  enabled: boolean;
  category?: string;
  createdAt: number;
}
```

---

## 10.5.2 匹配函数

```typescript
function normalizeDomain(input: string): string;

function extractDomain(url: string): string | null;

function isDomainMatched(currentDomain: string, rule: SiteRule): boolean;
```

---

## 10.5.3 匹配逻辑

```typescript
function isDomainMatched(currentDomain, ruleDomain) {
  if (currentDomain === ruleDomain) return true;
  if (currentDomain.endsWith("." + ruleDomain)) return true;
  return false;
}
```

需要避免：

```text
fakeyoutube.com 匹配 youtube.com
youtube.com.fake.com 匹配 youtube.com
```

---

# 10.6 解锁状态管理

## 10.6.1 数据结构

```typescript
interface UnlockState {
  domain: string;
  sleepSessionId: string;
  unlockedAt: number;
  expiresAt: number;
  reason?: string;
}
```

---

## 10.6.2 判断逻辑

```typescript
function isDomainUnlocked(domain: string, unlocks: UnlockState[], now: number): boolean {
  return unlocks.some(item =>
    item.domain === domain &&
    item.expiresAt > now
  );
}
```

---

## 10.6.3 自动过期

可以通过：

- 每次判断时过滤过期 unlock；
- 使用 `chrome.alarms` 定期清理；
- Popup / Options 打开时清理。

---

# 10.7 存储设计

## 10.7.1 本地存储 Key

| Key | 说明 |
|---|---|
| settings | 用户设置 |
| siteRules | 黑名单规则 |
| unlockStates | 当前解锁状态 |
| events | 行为事件 |
| onboardingCompleted | 是否完成引导 |
| pauseState | 暂停状态 |
| dailyStats | 统计缓存 |

---

## 10.7.2 Settings 数据结构

```typescript
interface Settings {
  enabled: boolean;
  schedule: SleepSchedule;
  mode: "gentle" | "standard" | "strict";
  unlock: UnlockSettings;
  reminder: ReminderSettings;
  blockPage: BlockPageSettings;
  privacy: PrivacySettings;
}
```

---

## 10.7.3 完整类型示例

```typescript
interface UnlockSettings {
  durationMinutes: number;
  maxUnlocksPerSession: number;
  cooldownSeconds: number;
  requireConfirmText: boolean;
  confirmText: string;
  requireReason: boolean;
}

interface ReminderSettings {
  enabled: boolean;
  notificationEnabled: boolean;
  bannerEnabled: boolean;
}

interface BlockPageSettings {
  personalMessage: string;
  showBenefits: boolean;
  showHarms: boolean;
  showActions: boolean;
}

interface PrivacySettings {
  storeFullUrl: boolean;
  storeDomainOnly: boolean;
}
```

---

## 10.7.4 事件结构

```typescript
interface EventLog {
  id: string;
  type:
    | "block_triggered"
    | "unlock_requested"
    | "unlock_granted"
    | "unlock_expired"
    | "reminder_sent"
    | "pause_enabled"
    | "settings_changed";
  timestamp: number;
  sleepSessionId: string;
  domain?: string;
  urlHash?: string;
  reason?: string;
  metadata?: Record<string, any>;
}
```

---

# 10.8 定时与提醒

## 10.8.1 使用 chrome.alarms

插件 Service Worker 不能长期运行，因此需要使用 alarms。

建议设置：

| Alarm | 频率 | 用途 |
|---|---:|---|
| checkReminder | 每 1 分钟 | 判断是否进入提醒窗口 |
| cleanupUnlocks | 每 5 分钟 | 清理过期解锁 |
| refreshBadge | 每 1 分钟 | 更新插件图标状态 |
| dailyMaintenance | 每天一次 | 清理旧事件、生成统计 |

---

## 10.8.2 通知防重复

记录：

```typescript
lastReminderSessionId
```

如果本 sleepSessionId 已发送提醒，则不重复发送。

---

# 10.9 Badge 设计

## 10.9.1 图标状态

| 状态 | Badge | 颜色 |
|---|---|---|
| 正常 | 空 | 默认 |
| 提醒期 | soon | 黄色 |
| 睡眠模式 | sleep | 蓝色/紫色 |
| 已暂停 | pause | 灰色 |
| 当前网站被解锁 | open | 绿色 |

---

# 10.10 内容脚本 Content Script

## 10.10.1 用途

v1 可选，用于在提醒期给黑名单网站加顶部提示条。

---

## 10.10.2 提示条内容

```text
距离晚安模式还有 15 分钟，建议开始收尾。
```

---

## 10.10.3 注入条件

- 当前网站在黑名单；
- 当前时间处于提醒窗口；
- 用户开启提示条；
- 当前页面不是插件页面。

---

# 11. 阻断决策逻辑

## 11.1 shouldBlock 函数

```typescript
async function shouldBlock(url: string): Promise<BlockDecision> {
  const settings = await getSettings();

  if (!settings.enabled) return { block: false, reason: "disabled" };

  if (isExtensionUrl(url)) return { block: false, reason: "extension_page" };

  const pauseState = await getPauseState();
  if (isPaused(pauseState)) return { block: false, reason: "paused" };

  const now = new Date();
  if (!isInSleepMode(now, settings.schedule)) {
    return { block: false, reason: "not_sleep_time" };
  }

  const domain = extractDomain(url);
  if (!domain) return { block: false, reason: "invalid_url" };

  const matchedRule = await findMatchedRule(domain);
  if (!matchedRule) return { block: false, reason: "not_blacklisted" };

  const unlocks = await getUnlockStates();
  if (isDomainUnlocked(domain, unlocks, Date.now())) {
    return { block: false, reason: "unlocked" };
  }

  return {
    block: true,
    reason: "sleep_mode",
    domain,
    matchedRule
  };
}
```

---

# 12. 安全与隐私设计

## 12.1 隐私原则

| 原则 | 说明 |
|---|---|
| 默认本地存储 | 不上传数据 |
| 最小化采集 | 默认只记录域名，不记录完整 URL |
| 不采集页面内容 | 不读取网页正文 |
| 不采集输入内容 | 不监听输入框 |
| 用户可清空数据 | 设置页提供清空入口 |
| 用户可导出数据 | JSON 导出 |
| 权限用途透明 | 首次引导说明权限原因 |

---

## 12.2 隐私说明文案

```text
我们默认只在你的本地浏览器中保存设置和统计数据。
插件不会读取网页正文，不会记录你的输入内容，也不会上传浏览记录。
为了判断是否需要阻断，插件需要读取当前标签页的网址。
```

---

## 12.3 数据保留策略

| 数据 | 保留周期 |
|---|---:|
| 设置 | 永久，直到用户删除 |
| 黑名单 | 永久 |
| 解锁状态 | 过期后自动清理 |
| 事件记录 | 默认保留 90 天 |
| 统计缓存 | 默认保留 180 天 |

---

# 13. 异常场景

## 13.1 系统时间被修改

处理方式：

- v1 不做强校验；
- 可记录异常时间跳变；
- 后续可通过网络时间校验。

---

## 13.2 用户打开隐身模式

Chrome 插件默认不在隐身模式运行。

处理：

- 在设置页提示用户可手动允许隐身模式；
- 不强制。

文案：

```text
如果你常在隐身模式中浏览，建议在浏览器扩展设置中允许本插件在隐身模式运行。
```

---

## 13.3 用户卸载插件

不可防止。

产品策略：

- 不承诺防卸载；
- 通过温和体验降低卸载概率。

---

## 13.4 用户切换浏览器

不可防止。

产品策略：

- 后续支持 Edge / Firefox；
- 提供跨浏览器同步。

---

## 13.5 Service Worker 休眠

使用：

- chrome.alarms；
- tabs 事件；
- storage 持久化状态。

---

## 13.6 阻断页循环跳转

避免条件：

```text
如果 URL 以 chrome-extension:// 当前插件 ID 开头，则不处理
```

---

# 14. 指标设计

## 14.1 产品指标

| 指标 | 说明 |
|---|---|
| 安装完成率 | 安装后完成 onboarding 的比例 |
| 睡眠时间设置率 | 完成设置用户占比 |
| 黑名单添加率 | 添加至少一个网站的用户占比 |
| 7 日留存 | 安装 7 天后仍使用 |
| 30 日留存 | 安装 30 天后仍使用 |
| 插件禁用率 | 用户关闭插件比例 |
| 卸载率 | 用户卸载比例 |

---

## 14.2 行为指标

| 指标 | 说明 |
|---|---|
| 每晚阻断次数 | 用户晚间访问黑名单次数 |
| 每晚解锁次数 | 用户解锁频率 |
| 阻断后放弃率 | 被阻断后未解锁的比例 |
| 解锁后继续阻断率 | 解锁结束后再次被阻断比例 |
| 最常阻断域名 | 主要熬夜来源 |
| 平均最晚阻断时间 | 反映熬夜程度 |

---

## 14.3 效果指标

可以通过主观问卷获取：

| 指标 | 说明 |
|---|---|
| 自评是否更早睡 | 用户主观反馈 |
| 次日精神评分 | 1-5 分 |
| 工具帮助程度 | 1-5 分 |
| 用户愿意推荐程度 | NPS |

---

# 15. 发布计划

## 15.1 v0.1 内测版

功能：

- 设置睡觉时间；
- 手动添加黑名单；
- 到点跳转阻断页；
- 临时解锁；
- 本地事件记录。

目标：

- 验证阻断逻辑稳定性。

---

## 15.2 v0.2 Alpha

新增：

- Onboarding；
- Popup 首页；
- 睡前通知；
- 内置网站模板；
- 数据统计基础页。

目标：

- 完成完整用户闭环。

---

## 15.3 v1.0 正式版

新增：

- 三种阻断强度；
- 解锁确认语；
- 冷静期；
- 数据导出/清空；
- 隐私说明；
- Chrome Web Store 上架材料。

---

# 16. 开发任务拆分

## 16.1 前端任务

| 模块 | 任务 |
|---|---|
| Popup | 状态展示、快捷暂停、添加当前网站 |
| Options | 设置页完整表单 |
| Block Page | 阻断展示、解锁流程 |
| Onboarding | 初始设置向导 |
| Stats | 图表和统计卡片 |
| UI 组件 | Button、Input、TimePicker、Modal |

---

## 16.2 后台任务

| 模块 | 任务 |
|---|---|
| Service Worker | tabs 监听、alarms、通知 |
| Storage | 设置读写、事件记录 |
| Rule Engine | 域名匹配、时间判断 |
| Unlock Engine | 解锁状态、次数限制 |
| Stats Engine | 日统计、周统计 |
| Migration | 数据结构版本迁移 |

---

## 16.3 测试任务

| 测试类型 | 内容 |
|---|---|
| 单元测试 | 时间判断、域名匹配、解锁判断 |
| 集成测试 | tabs 跳转、阻断页参数 |
| 手动测试 | Chrome / Edge 各版本 |
| 边界测试 | 跨天睡眠、周末规则、暂停状态 |
| 隐私测试 | 是否记录敏感 URL |
| 性能测试 | 大量黑名单规则下响应速度 |

---

# 17. 关键测试用例

## 17.1 时间判断

| 场景 | bedtime | wakeTime | 当前时间 | 结果 |
|---|---|---|---|---|
| 跨天睡眠中 | 23:30 | 07:00 | 00:30 | 睡眠模式 |
| 跨天睡眠前 | 23:30 | 07:00 | 22:00 | 非睡眠模式 |
| 跨天睡眠后 | 23:30 | 07:00 | 08:00 | 非睡眠模式 |
| 当天区间中 | 13:00 | 14:00 | 13:30 | 睡眠模式 |
| 临界开始 | 23:30 | 07:00 | 23:30 | 睡眠模式 |
| 临界结束 | 23:30 | 07:00 | 07:00 | 非睡眠模式 |

---

## 17.2 域名匹配

| 规则 | 当前域名 | 是否匹配 |
|---|---|---:|
| youtube.com | youtube.com | 是 |
| youtube.com | www.youtube.com | 是 |
| youtube.com | m.youtube.com | 是 |
| youtube.com | fakeyoutube.com | 否 |
| youtube.com | youtube.com.fake.com | 否 |
| reddit.com | old.reddit.com | 是 |
| x.com | twitter.com | 否，除非都添加 |

---

## 17.3 解锁判断

| 场景 | 结果 |
|---|---|
| 当前域名已解锁且未过期 | 不阻断 |
| 当前域名已解锁但过期 | 阻断 |
| youtube.com 解锁，访问 bilibili.com | 阻断 |
| 达到每晚最大解锁次数 | 不允许解锁 |
| 插件暂停 | 不阻断 |

---

# 18. 风险分析

## 18.1 技术风险

| 风险 | 等级 | 应对 |
|---|---:|---|
| Service Worker 休眠导致提醒不准 | 中 | 使用 chrome.alarms |
| tabs 监听阻断有延迟 | 中 | 后续引入 DNR |
| 域名匹配误伤 | 中 | 做规则预览和编辑 |
| 隐身模式无法阻断 | 低 | 提示用户开启 |
| 浏览器政策变化 | 中 | 遵循 Manifest V3 |

---

## 18.2 产品风险

| 风险 | 等级 | 应对 |
|---|---:|---|
| 用户觉得太强制而卸载 | 高 | 允许温和模式和临时解锁 |
| 用户觉得太弱没效果 | 中 | 提供严格模式 |
| 黑名单配置麻烦 | 中 | 提供模板和当前网站一键添加 |
| 用户绕过插件 | 高 | 不承诺绝对强制，强调辅助自律 |
| 文案让用户焦虑 | 中 | 使用温和、支持性的表达 |

---

## 18.3 合规与隐私风险

| 风险 | 等级 | 应对 |
|---|---:|---|
| 浏览器商店审核关注权限 | 中 | 权限说明透明 |
| 用户担心浏览记录泄露 | 高 | 默认本地存储，不上传 |
| 记录完整 URL 敏感 | 高 | 默认关闭完整 URL 记录 |
| 内容脚本权限敏感 | 中 | v1 可不做或可选 |

---

# 19. 上架材料建议

## 19.1 插件名称

可选：

- 晚安边界
- GoodNight Guard
- 数字宵禁
- Sleep Web Blocker
- 不熬夜网页助手

---

## 19.2 简短描述

```text
到点自动阻断让你熬夜的网站，帮你准时睡觉。
```

---

## 19.3 详细描述

```text
晚安边界是一款帮助你减少睡前刷网页的浏览器插件。

你可以设置自己的睡觉时间和需要限制的网站。
当晚安模式开启后，插件会自动阻断 YouTube、B 站、Reddit、小说站等容易让你熬夜的网站，并跳转到温和的晚安提醒页面。

如果确实需要继续使用，你也可以临时解锁几分钟。
所有数据默认保存在本地，不上传浏览记录。
```

---

# 20. MVP 验收标准

v1.0 完成标准：

| 标准 | 验收方式 |
|---|---|
| 用户可完成初始设置 | 安装后进入 Onboarding |
| 用户可设置睡觉时间 | Options 可编辑并保存 |
| 用户可添加黑名单网站 | 手动添加 + 当前网站添加 |
| 到点访问黑名单会被阻断 | Chrome / Edge 测试通过 |
| 阻断页显示原网站信息 | URL 参数解析正确 |
| 用户可临时解锁 | 解锁后可访问指定域名 |
| 解锁过期后重新阻断 | 自动恢复 |
| 睡前通知可触发 | alarms + notifications 测试通过 |
| 今日统计正确 | block/unlock 事件记录准确 |
| 用户可清空数据 | 设置页清空后生效 |
| 不记录页面内容 | 代码审查确认 |
| 不阻断插件自身页面 | 无循环跳转 |

---

# 21. 总结

该浏览器插件版产品的核心闭环是：

```text
设置睡觉时间
↓
设置容易熬夜的网站
↓
睡前提醒
↓
到点阻断
↓
晚安页面劝退
↓
必要时临时解锁
↓
记录和复盘
```

第一版不要追求“绝对强制”，而要追求：

- **有效阻断常见熬夜网页**
- **低成本配置**
- **温和但有摩擦的解锁**
- **清晰的睡眠边界感**
- **强隐私、本地优先**

最推荐的技术实现路径是：

```text
Manifest V3
+ tabs.onUpdated 监听
+ chrome.storage.local
+ chrome.alarms
+ chrome.notifications
+ React/TypeScript 设置页与阻断页
```

这个 MVP 技术可行性高，开发复杂度可控，能够较快验证用户是否真的需要一个“到点不让自己继续刷网页”的睡眠边界工具。