import type { LocaleCatalog } from "../types";

export const en: LocaleCatalog = {
  locale: "en",
  brand: {
    name: "FocusGate",
    fullName: "FocusGate",
    slogan: "Guard your attention when it matters.",
    shortDescription: "Use rule groups to create enforceable website boundaries for sleep, focus, and digital reset time.",
    defaultSleepGroupName: "Goodnight Guard"
  },
  common: {
    loading: "Loading",
    settings: "Settings",
    openSettings: "Open settings",
    saveSettings: "Save settings",
    saved: "Saved",
    completeSetup: "Complete setup",
    enabled: "Enabled",
    disabled: "Disabled",
    close: "Close",
    back: "Back",
    currentRuleGroup: "Current rule group",
    ruleGroupFallback: "rule group",
    currentPageFallback: "Current page",
    siteExamplePlaceholder: "For example, bilibili.com",
    externalUrlPlaceholder: "https://example.com/todo",
    dismiss: "Got it"
  },
  language: {
    label: "App language",
    helper: "Auto follows your browser. Manual language changes affect app chrome only and never overwrite saved rule-group content.",
    options: {
      auto: "Follow browser",
      "zh-CN": "简体中文",
      en: "English"
    }
  },
  units: {
    minutes: (value) => `${value} ${value === 1 ? "minute" : "minutes"}`,
    hours: (value) => `${value} ${value === 1 ? "hour" : "hours"}`,
    count: (value) => `${value} ${value === 1 ? "time" : "times"}`,
    sites: (value) => `${value} ${value === 1 ? "site" : "sites"}`,
    ruleGroups: (value) => `${value} ${value === 1 ? "rule group" : "rule groups"}`,
    remainingUnlocks: (value) => `${value} left`,
    unlimited: "Unlimited"
  },
  weekdays: {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat"
  },
  defaults: {
    sleepCommitment: "My tomorrow morning self will thank me for stopping now.",
    sleepRuleGroupName: "Goodnight Guard",
    workRuleGroupName: "Work Focus",
    workCommitment: "Do the important work first, then come back to entertainment.",
    unnamedRuleGroup: "Untitled rule group",
    fallbackCommitment: "My future self will thank me for stopping now."
  },
  blockPageDefaults: {
    sleep: {
      title: "It is time to wind down",
      description: "More browsing will make tomorrow morning harder. Put the screen down and let this boundary take effect.",
      primaryActionLabel: "Close this page",
      handoffTitle: "Wind-down steps"
    },
    focus: {
      title: "This is protected time",
      description: "This site is interrupting the time protected by this rule group. Leave it now and return to what you meant to do.",
      primaryActionLabel: "Close and return to focus",
      handoffTitle: "Return to focus"
    }
  },
  popup: {
    currentPage: "Current page",
    loadingStatus: "Reading current status",
    loadingPlan: "Reading plan...",
    matchedRuleGroup: "Matched rule group",
    noMatchedRuleGroup: "No rule group matched",
    todayBlocked: "Blocked today",
    todayUnlocked: "Unlocked today",
    addToRuleGroupLabel: "Add to rule group",
    alreadyInRuleGroup: "Already in this rule group",
    addToGroup: (groupName) => `Add to ${groupName}`,
    onboardingNeeded: "Complete initial setup first",
    pausedRemaining: (duration) => `Paused, ${duration} remaining`,
    activeSummary: (activeCount, upcomingCount) => `${activeCount} active, ${upcomingCount} starting soon`,
    enabledSummary: (enabledCount) => `${enabledCount} enabled`,
    pauseFifteenMinutes: "Pause for 15 minutes",
    previewBlockPage: "Preview block page",
    status: {
      loading: {
        label: "Reading current status",
        detail: () => "Reading plan..."
      },
      blocked: {
        label: "This page will be blocked",
        detail: (context) =>
          context.matchedRuleGroupName ? `${context.matchedRuleGroupName} is protecting this site.` : "A rule group is protecting this site."
      },
      unlocked: {
        label: "This page is temporarily unlocked",
        detail: (context) =>
          context.matchedRuleGroupName
            ? `${context.matchedRuleGroupName} still has an active temporary unlock.`
            : "The temporary unlock is still active."
      },
      upcoming: {
        label: "This page will be limited soon",
        detail: (context) =>
          context.matchedRuleGroupName ? `${context.matchedRuleGroupName} starts soon. Prepare to wrap up.` : "A restriction starts soon. Prepare to wrap up."
      },
      outside_schedule: {
        label: "This page is outside rule time",
        detail: () => "This site is in a rule group, but the schedule is not active now."
      },
      not_listed: {
        label: "This page is not in a rule group",
        detail: (context) => (context.selectedRuleGroupName ? `You can add it to ${context.selectedRuleGroupName}.` : "Create a rule group first.")
      },
      paused: {
        label: "FocusGate is paused",
        detail: () => "Matching rule groups will resume after the pause ends."
      },
      inactive: {
        label: "No restriction rules are enabled",
        detail: () => "Enable a rule group and FocusGate will enforce it on schedule."
      },
      not_http: {
        label: "This page cannot be added",
        detail: () => "Switch to a regular web page before managing rule groups."
      }
    }
  },
  welcome: {
    openOptions: "Open settings",
    eyebrow: "Attention boundaries in your browser",
    headingLine1: "When it is time to focus,",
    headingLine2: "guard your attention boundary.",
    body:
      "FocusGate uses rule groups to create enforceable website boundaries for sleep, work, study, and digital reset time. You set the rules in advance; the extension reminds, blocks, hands off to the next step, and records boundary activity locally.",
    startSetup: "Set up boundaries",
    viewPopup: "View extension popup",
    workflowAria: "How FocusGate works",
    workflowTitle: "Rule groups hold the boundary",
    workflow: ["Create a rule group", "Choose restricted sites and time", "Set commitment, reminder, and block page", "Let FocusGate enforce it on schedule"],
    scenarios: [
      {
        kind: "sleep",
        title: "Wind down at night",
        copy: "Keep the default Goodnight Guard so entertainment sites step aside during rest time."
      },
      {
        kind: "work",
        title: "Protect work focus",
        copy: "Create weekday rule groups so video, communities, and feeds become harder to open during key hours."
      },
      {
        kind: "reset",
        title: "Reduce high-stimulus loops",
        copy: "Add reminders, blocks, and unlock friction so the decision stays with your clearer self."
      }
    ],
    note: "Reminders, block pages, temporary unlocks, and handoff pages are configured per rule group, so sleep, work, and reset boundaries can use different copy and strength."
  },
  options: {
    title: "Rule group settings",
    onboardingTitle: "Complete initial rule-group setup",
    brandHome: "Brand home",
    onboardingNotice:
      "Start with the default Goodnight Guard, or add rule groups such as Work Focus. Each group has its own schedule, sites, commitment, reminder, block page, and unlock limits.",
    panels: {
      ruleGroups: "Rule groups",
      basics: "Rule group basics",
      sites: "Website rules",
      blockMode: "Block strength",
      blockPage: "Block page",
      unlock: "Unlock settings",
      stats: "Current group stats",
      privacy: "Privacy and data",
      language: "Language"
    },
    ruleGroup: {
      new: "New rule group",
      name: "Rule group name",
      enabled: "Enabled",
      statusLine: (enabled, siteCount) => `${enabled ? "Enabled" : "Disabled"} · ${siteCount} ${siteCount === 1 ? "site" : "sites"}`,
      deleteCurrent: "Delete current rule group"
    },
    schedule: {
      startTime: "Start time",
      endTime: "End time",
      reminder: "Advance reminder",
      noReminder: "No reminder",
      reminderOption: (minutes) => `${minutes} minutes before`,
      repeatDays: "Repeat days"
    },
    sites: {
      add: "Add",
      deleteAria: (host) => `Remove ${host}`
    },
    blockModes: {
      gentle: { label: "Gentle", note: "Unlimited unlocks while keeping reminders and the boundary visible." },
      standard: { label: "Standard", note: "Three unlocks per session. Good for everyday use." },
      strict: { label: "Strict", note: "One unlock per session, with stronger friction." }
    },
    blockPageTones: {
      sleep: { label: "Sleep", note: "Low-light and quiet, best for bedtime boundaries." },
      focus: { label: "Focus", note: "Clear and direct, best for work or study." },
      calm: { label: "Calm", note: "Soft and neutral for everyday moderation." },
      strict: { label: "Firm", note: "Stronger emphasis for high-risk sites." }
    },
    primaryActions: {
      close: { label: "Close page", note: "Keep the default behavior and try to close the block page." },
      external_url: { label: "Open link", note: "Go to a workspace, task system, or another web page." },
      handoff_html: { label: "Open handoff page", note: "Show static HTML inside the extension." }
    },
    blockPage: {
      title: "Page title",
      primaryActionLabel: "Primary button text",
      description: "Description",
      primaryAction: "Primary button action",
      externalUrl: "External link",
      externalUrlHelp: "Only http:// and https:// links are supported. Temporary unlocks still return to the original site.",
      handoffTitle: "Handoff page title",
      importHandoff: "Import handoff page",
      handoffHtml: "Handoff HTML",
      htmlVariablesWithTime: (maxKb) =>
        `Maximum ${maxKb}KB. Available variables: {{groupName}}, {{site}}, {{commitment}}, {{unlockMinutes}}, {{time}}.`,
      builtInStyle: "Built-in style",
      customHtmlEnabled: "Use custom HTML",
      customHtmlHelp: "Only static HTML/CSS is rendered. Scripts, forms, and top-level navigation do not receive permissions.",
      singlePageHtml: "Single-page HTML",
      htmlConstraints: "HTML constraints",
      htmlVariables: (maxKb) => `Maximum ${maxKb}KB. Available variables: {{groupName}}, {{site}}, {{commitment}}, {{unlockMinutes}}.`,
      importHtml: "Import .html",
      restoreDefault: "Restore default",
      customPreview: "Custom HTML preview",
      defaultPreview: "Default page preview",
      commitmentLabel: "Commitment",
      handoffPreview: "Handoff preview",
      handoffTitlePreview: "Page title",
      handoffEmpty: "Add HTML and it will preview here.",
      customPreviewTitle: "Custom block-page HTML preview",
      handoffPreviewTitle: "Handoff HTML preview"
    },
    unlock: {
      minutes: "Temporary unlock duration",
      maxPerSession: "Maximum unlocks per session",
      recordReason: "Record unlock reason",
      commitment: "Commitment"
    },
    stats: {
      currentSessionBlocked: "Blocked this session",
      currentSessionUnlocked: "Unlocked this session",
      todayBlocked: "Blocked today",
      todayUnlocked: "Unlocked today",
      topBlocked: "Most blocked",
      noBlocks: "No block records yet."
    },
    privacy: {
      description:
        "The extension stores settings, domain-level events, rule-group attribution, and unlock reasons locally. It does not record page titles, full browsing history, or page content.",
      clear: "Clear stats and temporary state"
    }
  },
  block: {
    fallbackSite: "this site",
    fallbackTitle: "This is protected time",
    interceptedSite: (site) => `Blocked access: ${site}`,
    loadingRule: "Reading block rule.",
    primaryFallback: "Close page",
    breathe: "Take a breath and pause...",
    limitReachedMessage: "The temporary unlock limit for this session has been used. Close the page and let this boundary continue.",
    unlockReason: "Unlock reason",
    unlockReasons: {
      work: "Needed for work",
      study: "Study material",
      urgent: "Urgent issue",
      other: "Other reason"
    },
    confirmationIntro: "To confirm you really need to unlock, type:",
    confirmationText: "I know I am crossing a boundary, but I choose to unlock",
    confirmationPlaceholder: "Type the text above",
    keepBoundary: "Keep the boundary",
    confirmUnlock: "Confirm unlock",
    unlockFallback: (minutes) => `Temporary unlock for ${minutes} ${minutes === 1 ? "minute" : "minutes"}`,
    unlockLimitReached: "Unlock limit used for this session",
    unlockLabel: (minutes, remaining) => `Temporary unlock for ${minutes} ${minutes === 1 ? "minute" : "minutes"} (${remaining})`,
    commitmentLabel: "Current rule-group commitment:",
    customIframeTitle: (groupName) => `${groupName} custom block page`,
    tones: {
      sleep: {
        positiveTitle: "What stopping now protects",
        positiveItems: ["A clearer morning", "A steadier mood", "Tomorrow's plan becomes easier to keep"],
        costTitle: "What more browsing costs",
        costItems: ["Waking up gets harder", "Attention drops", "Delay and anxiety get easier to trigger"]
      },
      focus: {
        positiveTitle: "What leaving now protects",
        positiveItems: ["Attention returns to the main task", "Your work rhythm stays intact", "Today's important work is easier to finish"],
        costTitle: "What more browsing costs",
        costItems: ["Short content takes the time", "Switching back gets harder", "The next plan gets pushed again"]
      },
      calm: {
        positiveTitle: "What holding the boundary protects",
        positiveItems: ["Less impulsive switching", "More energy for what matters", "The rule stays stable and credible"],
        costTitle: "What crossing the boundary costs",
        costItems: ["Exceptions become easier", "The rule loses trust", "Later choices take more effort"]
      },
      strict: {
        positiveTitle: "What stopping now protects",
        positiveItems: ["The high-risk entry point closes now", "Your remaining willpower is preserved", "The strict rule stays useful"],
        costTitle: "What continuing costs",
        costItems: ["One break can become a streak", "Unlocks run out quickly", "The current goal gets displaced"]
      }
    }
  },
  handoff: {
    fallbackSite: "this site",
    fallbackTitle: "Next step",
    leftSite: (site) => `You have left ${site}. This page supports the next step and does not unlock the original site.`,
    emptyTitle: "No handoff content configured",
    emptyBody: "In the rule group's block-page settings, choose Open handoff page and add sleep prompts, a work checklist, or review notes.",
    openSettings: "Open settings",
    iframeTitle: (groupName) => `${groupName} handoff page`
  },
  reminder: {
    closeAria: "Collapse reminder",
    startsSoon: (groupName) => (groupName ? `${groupName} starts soon` : "A restriction starts soon"),
    entersAfter: (duration) => `Restricted time starts in ${duration}`,
    message: (groupName) => `This page will soon be blocked by ${groupName ?? "the current rule group"}. Wrap up, save progress, then move to the next step.`,
    progressLabel: "Time remaining",
    remaining: (duration) => `${duration} left`,
    progressAria: "Time remaining before restricted time",
    fallbackCommitment: "My future self will thank me for stopping now.",
    dismiss: "Got it"
  },
  background: {
    reminderTitle: (groupName) => (groupName ? `${groupName} starts soon` : "A restriction starts soon"),
    reminderMessage: (minutes) => `Restricted time starts in ${minutes} ${minutes === 1 ? "minute" : "minutes"}. FocusGate will help you hold this boundary.`
  }
};
