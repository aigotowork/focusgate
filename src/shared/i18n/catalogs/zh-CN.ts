import type { LocaleCatalog } from "../types";

export const zhCN: LocaleCatalog = {
  locale: "zh-CN",
  brand: {
    name: "守界",
    fullName: "FocusGate / 守界",
    slogan: "该专注时，守住你的注意力边界。",
    shortDescription: "用规则组为睡眠、工作和戒断场景建立可执行的网站边界。",
    defaultSleepGroupName: "晚安守护"
  },
  common: {
    loading: "正在读取",
    settings: "设置",
    openSettings: "打开设置",
    saveSettings: "保存设置",
    saved: "已保存",
    completeSetup: "完成设置",
    enabled: "启用",
    disabled: "停用",
    close: "关闭",
    back: "返回",
    currentRuleGroup: "当前规则组",
    ruleGroupFallback: "规则组",
    currentPageFallback: "当前页面",
    siteExamplePlaceholder: "例如 bilibili.com",
    externalUrlPlaceholder: "https://example.com/todo",
    dismiss: "我知道了"
  },
  language: {
    label: "应用语言",
    helper: "默认跟随浏览器；手动选择只改变界面文案，不会覆盖已保存的规则组内容。",
    options: {
      auto: "跟随浏览器",
      "zh-CN": "简体中文",
      en: "English"
    }
  },
  units: {
    minutes: (value) => `${value} 分钟`,
    hours: (value) => `${value} 小时`,
    count: (value) => `${value} 次`,
    sites: (value) => `${value} 个站点`,
    ruleGroups: (value) => `${value} 个规则组`,
    remainingUnlocks: (value) => `剩余 ${value} 次`,
    unlimited: "不限次数"
  },
  weekdays: {
    0: "日",
    1: "一",
    2: "二",
    3: "三",
    4: "四",
    5: "五",
    6: "六"
  },
  defaults: {
    sleepCommitment: "明天早上的我，会感谢现在睡觉的我。",
    sleepRuleGroupName: "晚安守护",
    workRuleGroupName: "工作时间专注",
    workCommitment: "先把重要的事做完，再看娱乐内容。",
    unnamedRuleGroup: "未命名规则组",
    fallbackCommitment: "明天早上的我，会感谢现在停下来的我。"
  },
  blockPageDefaults: {
    sleep: {
      title: "现在是晚安时间",
      description: "继续浏览会让明天早晨更难醒来。把屏幕放下，让这条边界开始生效。",
      primaryActionLabel: "关掉网页，我去睡了",
      handoffTitle: "睡前收束"
    },
    focus: {
      title: "现在是限制时间",
      description: "这个网站正在打断当前规则组保护的时间。先离开这里，回到你真正想完成的事情。",
      primaryActionLabel: "关闭页面，回到正事",
      handoffTitle: "回到正事"
    }
  },
  popup: {
    currentPage: "当前页面",
    loadingStatus: "正在读取当前状态",
    loadingPlan: "正在读取计划...",
    matchedRuleGroup: "命中规则组",
    noMatchedRuleGroup: "未命中任何规则组",
    todayBlocked: "今日阻断",
    todayUnlocked: "今日解锁",
    addToRuleGroupLabel: "加入到规则组",
    alreadyInRuleGroup: "已在该规则组",
    addToGroup: (groupName) => `加入到 ${groupName}`,
    onboardingNeeded: "请先完成初始设置",
    pausedRemaining: (duration) => `已暂停，还剩 ${duration}`,
    activeSummary: (activeCount, upcomingCount) => `${activeCount} 个规则组正在生效，${upcomingCount} 个规则组即将开启`,
    enabledSummary: (enabledCount) => `${enabledCount} 个规则组已启用`,
    pauseFifteenMinutes: "暂停 15 分钟",
    previewBlockPage: "预览阻断页",
    status: {
      loading: {
        label: "正在读取当前状态",
        detail: () => "正在读取计划..."
      },
      blocked: {
        label: "当前页面会被阻断",
        detail: (context) =>
          context.matchedRuleGroupName ? `${context.matchedRuleGroupName} 正在保护这个网站。` : "有规则正在保护这个网站。"
      },
      unlocked: {
        label: "当前页面已临时解锁",
        detail: (context) =>
          context.matchedRuleGroupName ? `${context.matchedRuleGroupName} 的临时解锁仍在有效期内。` : "临时解锁仍在有效期内。"
      },
      upcoming: {
        label: "当前页面即将受限",
        detail: (context) =>
          context.matchedRuleGroupName ? `${context.matchedRuleGroupName} 即将开始，请准备收尾。` : "限制规则即将开始，请准备收尾。"
      },
      outside_schedule: {
        label: "当前页面在规则时间外",
        detail: () => "这个网站已加入规则组，但现在不是限制时段。"
      },
      not_listed: {
        label: "当前页面未加入规则",
        detail: (context) => (context.selectedRuleGroupName ? `可以把它加入 ${context.selectedRuleGroupName}。` : "请先创建一个规则组。")
      },
      paused: {
        label: "守界已暂停",
        detail: () => "暂停结束后，命中的规则组会继续生效。"
      },
      inactive: {
        label: "没有启用的限制规则",
        detail: () => "启用规则组后，守界会按时间自动执行。"
      },
      not_http: {
        label: "当前页面不可加入",
        detail: () => "请切换到普通网页后再管理规则组。"
      }
    }
  },
  welcome: {
    openOptions: "打开设置",
    eyebrow: "浏览器里的注意力边界",
    headingLine1: "该专注时，",
    headingLine2: "守住你的注意力边界。",
    body: "守界用规则组为睡眠、工作和戒断场景建立可执行的网站边界。你提前设定规则，插件在关键时段提醒、阻断、承接下一步，并记录边界执行情况。",
    startSetup: "开始设置边界",
    viewPopup: "查看插件弹窗",
    workflowAria: "守界工作方式",
    workflowTitle: "规则组正在守住边界",
    workflow: ["创建一个规则组", "选择限制站点和时间", "设置承诺语、提醒和阻断页", "到点由守界执行边界"],
    scenarios: [
      {
        kind: "sleep",
        title: "睡前放下",
        copy: "保留默认的“晚安守护”，让娱乐网站在休息时间主动退场。"
      },
      {
        kind: "work",
        title: "工作专注",
        copy: "为工作日设置规则组，让视频、社区和信息流在关键时段变得更难打开。"
      },
      {
        kind: "reset",
        title: "戒断节制",
        copy: "对高刺激站点增加提醒、阻断和解锁摩擦，把选择权留给清醒的自己。"
      }
    ],
    note: "提前提醒、阻断页、临时解锁和承接页都按规则组配置。睡眠、工作和戒断可以拥有不同文案与不同强度。"
  },
  options: {
    title: "规则组设置",
    onboardingTitle: "完成规则组初始设置",
    brandHome: "品牌主页",
    onboardingNotice:
      "先保留默认的“晚安守护”，也可以新增“工作时间专注”等规则组。每个规则组都有自己的时间、站点、承诺语、提醒、阻断页和解锁限制。",
    panels: {
      ruleGroups: "规则组",
      basics: "规则组基础",
      sites: "网站规则",
      blockMode: "阻断强度",
      blockPage: "阻断页展示",
      unlock: "解锁设置",
      stats: "当前组统计",
      privacy: "隐私与数据",
      language: "语言"
    },
    ruleGroup: {
      new: "新建规则组",
      name: "规则组名称",
      enabled: "启用",
      statusLine: (enabled, siteCount) => `${enabled ? "启用" : "停用"} · ${siteCount} 个站点`,
      deleteCurrent: "删除当前规则组"
    },
    schedule: {
      startTime: "开始时间",
      endTime: "结束时间",
      reminder: "提前提醒",
      noReminder: "不提醒",
      reminderOption: (minutes) => `提前 ${minutes} 分钟`,
      repeatDays: "重复日期"
    },
    sites: {
      add: "添加",
      deleteAria: (host) => `删除 ${host}`
    },
    blockModes: {
      gentle: { label: "温和", note: "不限解锁，保留提醒和边界。" },
      standard: { label: "标准", note: "每个周期 3 次解锁，适合默认使用。" },
      strict: { label: "严格", note: "每个周期 1 次解锁，冷静期更有重量。" }
    },
    blockPageTones: {
      sleep: { label: "晚安", note: "低光、安静，适合睡前边界。" },
      focus: { label: "专注", note: "清晰、利落，适合工作学习。" },
      calm: { label: "平静", note: "柔和中性，适合日常节制。" },
      strict: { label: "坚定", note: "更强提醒，适合高风险站点。" }
    },
    primaryActions: {
      close: { label: "关闭页面", note: "保持当前行为，点击后尝试关闭阻断页。" },
      external_url: { label: "跳转链接", note: "去到工作台、任务系统或其他网页。" },
      handoff_html: { label: "打开承接页", note: "在扩展内显示静态 HTML 内容。" }
    },
    blockPage: {
      title: "页面标题",
      primaryActionLabel: "主按钮文案",
      description: "说明文案",
      primaryAction: "主按钮行为",
      externalUrl: "跳转链接",
      externalUrlHelp: "只支持以 http:// 或 https:// 开头的外部链接。临时解锁仍会返回原网站，不受这里影响。",
      handoffTitle: "承接页标题",
      importHandoff: "导入承接页",
      handoffHtml: "承接页 HTML",
      htmlVariablesWithTime: (maxKb) =>
        `最大 ${maxKb}KB。可使用变量：{{groupName}}、{{site}}、{{commitment}}、{{unlockMinutes}}、{{time}}。`,
      builtInStyle: "内置风格",
      customHtmlEnabled: "使用自定义 HTML",
      customHtmlHelp: "仅渲染静态 HTML/CSS，脚本、表单和顶层跳转不会获得权限。",
      singlePageHtml: "单页 HTML",
      htmlConstraints: "HTML 约束",
      htmlVariables: (maxKb) => `最大 ${maxKb}KB。可使用变量：{{groupName}}、{{site}}、{{commitment}}、{{unlockMinutes}}。`,
      importHtml: "导入 .html",
      restoreDefault: "恢复默认",
      customPreview: "自定义 HTML 预览",
      defaultPreview: "默认页面预览",
      commitmentLabel: "承诺语",
      handoffPreview: "承接页预览",
      handoffTitlePreview: "页面标题",
      handoffEmpty: "填入 HTML 后会在这里预览。",
      customPreviewTitle: "阻断页自定义 HTML 预览",
      handoffPreviewTitle: "承接页 HTML 预览"
    },
    unlock: {
      minutes: "临时解锁时长",
      maxPerSession: "每个周期最大解锁次数",
      recordReason: "记录解锁原因",
      commitment: "承诺语"
    },
    stats: {
      currentSessionBlocked: "本周期阻断",
      currentSessionUnlocked: "本周期解锁",
      todayBlocked: "今日阻断",
      todayUnlocked: "今日解锁",
      topBlocked: "最常被阻断",
      noBlocks: "还没有阻断记录。"
    },
    privacy: {
      description: "插件只在本地保存设置、域名级事件、规则组归属和解锁原因，不记录页面标题、完整浏览历史或网页内容。",
      clear: "清空统计与临时状态"
    }
  },
  block: {
    fallbackSite: "这个网站",
    fallbackTitle: "现在是限制时间",
    interceptedSite: (site) => `已拦截访问：${site}`,
    loadingRule: "正在读取阻断规则。",
    primaryFallback: "关闭页面",
    breathe: "请深呼吸，冷静一下...",
    limitReachedMessage: "本周期的临时解锁次数已经用完。建议现在关掉网页，让这条边界继续生效。",
    unlockReason: "解锁原因",
    unlockReasons: {
      work: "工作需要",
      study: "学习资料",
      urgent: "紧急事项",
      other: "其他原因"
    },
    confirmationIntro: "为了确认你真的需要解锁，请输入：",
    confirmationText: "我知道正在突破边界，但我选择解锁",
    confirmationPlaceholder: "请输入上方文字",
    keepBoundary: "算了，保持边界",
    confirmUnlock: "确认解锁",
    unlockFallback: (minutes) => `临时解锁 ${minutes} 分钟`,
    unlockLimitReached: "本周期解锁次数已用完",
    unlockLabel: (minutes, remaining) => `临时解锁 ${minutes} 分钟（${remaining}）`,
    commitmentLabel: "当前规则组承诺语：",
    customIframeTitle: (groupName) => `${groupName} 自定义阻断页`,
    tones: {
      sleep: {
        positiveTitle: "现在收束的好处",
        positiveItems: ["明天早晨更清醒", "情绪更稳定", "更容易守住明天的计划"],
        costTitle: "继续浏览的代价",
        costItems: ["起床更困难", "注意力下降", "更容易陷入拖延焦虑"]
      },
      focus: {
        positiveTitle: "现在离开的好处",
        positiveItems: ["注意力回到主线", "工作节奏不被切碎", "更容易完成今天的重要事项"],
        costTitle: "继续浏览的代价",
        costItems: ["时间被短内容吞掉", "切回任务更困难", "下一个计划被继续推迟"]
      },
      calm: {
        positiveTitle: "保持边界的好处",
        positiveItems: ["减少冲动切换", "把精力留给重要的事", "让规则继续稳定生效"],
        costTitle: "突破边界的代价",
        costItems: ["更容易形成例外", "规则可信度下降", "后续选择会更费力"]
      },
      strict: {
        positiveTitle: "现在停下的好处",
        positiveItems: ["立即切断高风险入口", "保留最后的执行力", "让严格规则真正有用"],
        costTitle: "继续访问的代价",
        costItems: ["更容易连续破戒", "解锁次数很快耗尽", "当前目标会被迫让位"]
      }
    }
  },
  handoff: {
    fallbackSite: "这个网站",
    fallbackTitle: "下一步",
    leftSite: (site) => `已离开 ${site}。这个页面只承接下一步内容，不会解锁原网站。`,
    emptyTitle: "还没有配置承接页内容",
    emptyBody: "可以在规则组的“阻断页展示”里选择“打开承接页”，再填入睡前提示、工作清单或复盘说明。",
    openSettings: "打开设置",
    iframeTitle: (groupName) => `${groupName} 承接页`
  },
  reminder: {
    closeAria: "收起提醒",
    startsSoon: (groupName) => (groupName ? `${groupName}即将开启` : "限制规则即将开启"),
    entersAfter: (duration) => `${duration}后进入限制时间`,
    message: (groupName) => `这个页面很快会被“${groupName ?? "当前规则组"}”拦下。现在适合收尾、保存进度，然后切换到下一步。`,
    progressLabel: "剩余时间",
    remaining: (duration) => `还剩 ${duration}`,
    progressAria: "距离限制时间的剩余时间",
    fallbackCommitment: "明天早上的我，会感谢现在停下来的我。",
    dismiss: "我知道了"
  },
  background: {
    reminderTitle: (groupName) => `${groupName ?? "限制规则"}即将开启`,
    reminderMessage: (minutes) => `${minutes} 分钟后进入限制时间。守界会帮你守住这条边界。`
  }
};
