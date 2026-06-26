import type {
  BlockMode,
  BlockPagePrimaryActionType,
  BlockPageTone,
  PopupPageContext,
  UnlockReason,
  Weekday
} from "../types";
import type { LanguagePreference, SupportedLocale } from "./locales";

export interface LocaleCatalog {
  locale: SupportedLocale;
  brand: {
    name: string;
    fullName: string;
    slogan: string;
    shortDescription: string;
    defaultSleepGroupName: string;
  };
  common: {
    loading: string;
    settings: string;
    openSettings: string;
    saveSettings: string;
    saved: string;
    completeSetup: string;
    enabled: string;
    disabled: string;
    close: string;
    back: string;
    currentRuleGroup: string;
    ruleGroupFallback: string;
    currentPageFallback: string;
    siteExamplePlaceholder: string;
    externalUrlPlaceholder: string;
    dismiss: string;
  };
  language: {
    label: string;
    helper: string;
    options: Record<LanguagePreference, string>;
  };
  units: {
    minutes: (value: number) => string;
    hours: (value: number) => string;
    count: (value: number) => string;
    sites: (value: number) => string;
    ruleGroups: (value: number) => string;
    remainingUnlocks: (value: number) => string;
    unlimited: string;
  };
  weekdays: Record<Weekday, string>;
  defaults: {
    sleepCommitment: string;
    sleepRuleGroupName: string;
    workRuleGroupName: string;
    workCommitment: string;
    unnamedRuleGroup: string;
    fallbackCommitment: string;
  };
  blockPageDefaults: {
    sleep: {
      title: string;
      description: string;
      primaryActionLabel: string;
      handoffTitle: string;
    };
    focus: {
      title: string;
      description: string;
      primaryActionLabel: string;
      handoffTitle: string;
    };
  };
  popup: {
    currentPage: string;
    loadingStatus: string;
    loadingPlan: string;
    matchedRuleGroup: string;
    noMatchedRuleGroup: string;
    todayBlocked: string;
    todayUnlocked: string;
    addToRuleGroupLabel: string;
    alreadyInRuleGroup: string;
    addToGroup: (groupName: string) => string;
    onboardingNeeded: string;
    pausedRemaining: (duration: string) => string;
    activeSummary: (activeCount: number, upcomingCount: number) => string;
    enabledSummary: (enabledCount: number) => string;
    pauseFifteenMinutes: string;
    previewBlockPage: string;
    status: Record<
      PopupPageContext["status"],
      {
        label: string;
        detail: (context: PopupPageContext) => string;
      }
    >;
  };
  welcome: {
    openOptions: string;
    eyebrow: string;
    headingLine1: string;
    headingLine2: string;
    body: string;
    startSetup: string;
    viewPopup: string;
    workflowAria: string;
    workflowTitle: string;
    workflow: string[];
    scenarios: Array<{
      kind: "sleep" | "work" | "reset";
      title: string;
      copy: string;
    }>;
    note: string;
  };
  options: {
    title: string;
    onboardingTitle: string;
    brandHome: string;
    onboardingNotice: string;
    panels: {
      ruleGroups: string;
      basics: string;
      sites: string;
      blockMode: string;
      blockPage: string;
      unlock: string;
      stats: string;
      privacy: string;
      language: string;
    };
    ruleGroup: {
      new: string;
      name: string;
      enabled: string;
      statusLine: (enabled: boolean, siteCount: number) => string;
      deleteCurrent: string;
    };
    schedule: {
      startTime: string;
      endTime: string;
      reminder: string;
      noReminder: string;
      reminderOption: (minutes: number) => string;
      repeatDays: string;
    };
    sites: {
      add: string;
      deleteAria: (host: string) => string;
    };
    blockModes: Record<BlockMode, { label: string; note: string }>;
    blockPageTones: Record<BlockPageTone, { label: string; note: string }>;
    primaryActions: Record<BlockPagePrimaryActionType, { label: string; note: string }>;
    blockPage: {
      title: string;
      primaryActionLabel: string;
      description: string;
      primaryAction: string;
      externalUrl: string;
      externalUrlHelp: string;
      handoffTitle: string;
      importHandoff: string;
      handoffHtml: string;
      htmlVariablesWithTime: (maxKb: number) => string;
      builtInStyle: string;
      customHtmlEnabled: string;
      customHtmlHelp: string;
      singlePageHtml: string;
      htmlConstraints: string;
      htmlVariables: (maxKb: number) => string;
      importHtml: string;
      restoreDefault: string;
      customPreview: string;
      defaultPreview: string;
      commitmentLabel: string;
      handoffPreview: string;
      handoffTitlePreview: string;
      handoffEmpty: string;
      customPreviewTitle: string;
      handoffPreviewTitle: string;
    };
    unlock: {
      minutes: string;
      maxPerSession: string;
      recordReason: string;
      commitment: string;
    };
    stats: {
      currentSessionBlocked: string;
      currentSessionUnlocked: string;
      todayBlocked: string;
      todayUnlocked: string;
      topBlocked: string;
      noBlocks: string;
    };
    privacy: {
      description: string;
      clear: string;
    };
  };
  block: {
    fallbackSite: string;
    fallbackTitle: string;
    interceptedSite: (site: string) => string;
    loadingRule: string;
    primaryFallback: string;
    breathe: string;
    limitReachedMessage: string;
    unlockReason: string;
    unlockReasons: Record<UnlockReason, string>;
    confirmationIntro: string;
    confirmationText: string;
    confirmationPlaceholder: string;
    keepBoundary: string;
    confirmUnlock: string;
    unlockFallback: (minutes: number) => string;
    unlockLimitReached: string;
    unlockLabel: (minutes: number, remaining: string) => string;
    commitmentLabel: string;
    customIframeTitle: (groupName: string) => string;
    tones: Record<
      BlockPageTone,
      {
        positiveTitle: string;
        positiveItems: string[];
        costTitle: string;
        costItems: string[];
      }
    >;
  };
  handoff: {
    fallbackSite: string;
    fallbackTitle: string;
    leftSite: (site: string) => string;
    emptyTitle: string;
    emptyBody: string;
    openSettings: string;
    iframeTitle: (groupName: string) => string;
  };
  reminder: {
    closeAria: string;
    startsSoon: (groupName?: string) => string;
    entersAfter: (duration: string) => string;
    message: (groupName?: string) => string;
    progressLabel: string;
    remaining: (duration: string) => string;
    progressAria: string;
    fallbackCommitment: string;
    dismiss: string;
  };
  background: {
    reminderTitle: (groupName?: string) => string;
    reminderMessage: (minutes: number) => string;
  };
}

export type PopupStatusCopy = {
  label: string;
  detail: string;
};
