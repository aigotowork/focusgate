import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bell, CheckCircle2, Clock, Home, Plus, Power, Settings, ShieldAlert } from "lucide-react";
import "../styles/global.css";
import { BrandMark, BrandWordmark } from "../shared/brand-ui";
import { getActiveTabUrl, getExtensionUrl, openOptionsPage } from "../shared/browser";
import { formatDuration, getPopupStatusCopy, type LocaleCatalog, type SupportedLocale } from "../shared/i18n";
import { I18nProvider, useI18n } from "../shared/i18n/react";
import { buildStatsSummary } from "../shared/stats";
import { addSiteRule, getAppSettings, getGuardEvents, pauseGuard, recordGuardEvent } from "../shared/storage";
import {
  createSiteRule,
  evaluateAccess,
  extractHostnameFromUrl,
  getPopupPageContext,
  getRuleGroupById,
  matchesSiteRule
} from "../shared/sites";
import type { AppSettings, GuardEvent } from "../shared/types";

function PopupApp(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>();
  const [events, setEvents] = useState<GuardEvent[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [selectedGroupId, setSelectedGroupId] = useState<string>();

  useEffect(() => {
    void Promise.all([getAppSettings(), getGuardEvents(), getActiveTabUrl()]).then(
      ([nextSettings, nextEvents, nextUrl]) => {
        setSettings(nextSettings);
        setEvents(nextEvents);
        setCurrentUrl(nextUrl);
      }
    );
  }, []);

  return (
    <I18nProvider settings={settings}>
      <PopupContent
        currentUrl={currentUrl}
        events={events}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={setSelectedGroupId}
        setSettings={setSettings}
        settings={settings}
      />
    </I18nProvider>
  );
}

function PopupContent({
  currentUrl,
  events,
  selectedGroupId,
  setSelectedGroupId,
  setSettings,
  settings
}: {
  currentUrl: string | undefined;
  events: GuardEvent[];
  selectedGroupId: string | undefined;
  setSelectedGroupId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings | undefined>>;
  settings: AppSettings | undefined;
}): JSX.Element {
  const { locale, t } = useI18n();
  const host = useMemo(() => extractHostnameFromUrl(currentUrl ?? ""), [currentUrl]);
  const hostLabel = host ?? t.common.currentPageFallback;
  const decision = settings && currentUrl ? evaluateAccess(currentUrl, settings) : undefined;
  const pageContext = settings ? getPopupPageContext(settings, currentUrl) : undefined;
  const statusCopy = pageContext ? getPopupStatusCopy(pageContext, locale) : undefined;
  const stats = settings
    ? buildStatsSummary(events, settings.ruleGroups[0]?.schedule ?? { enabled: false, startTime: "00:00", endTime: "00:00", days: [] })
    : undefined;
  const selectedGroup =
    settings && selectedGroupId ? getRuleGroupById(settings, selectedGroupId) : undefined;
  const targetGroup =
    selectedGroup ??
    (settings && pageContext?.selectedRuleGroupId ? getRuleGroupById(settings, pageContext.selectedRuleGroupId) : undefined);
  const currentGroupContainsHost = Boolean(
    host && targetGroup?.sites.some((site) => matchesSiteRule(host, site))
  );
  const canAddCurrentSite = Boolean(host && targetGroup && !currentGroupContainsHost);

  useEffect(() => {
    if (!settings || !pageContext?.selectedRuleGroupId) {
      return;
    }
    setSelectedGroupId((current) => current ?? pageContext.selectedRuleGroupId);
  }, [pageContext?.selectedRuleGroupId, settings]);

  async function addCurrentSite(): Promise<void> {
    if (!host) {
      return;
    }
    const rule = createSiteRule(host);
    if (!rule || !targetGroup) {
      return;
    }
    const next = await addSiteRule(rule, targetGroup.id);
    await recordGuardEvent({ type: "site_added", host: rule.host, ruleGroupId: targetGroup.id, ruleGroupName: targetGroup.name });
    setSettings(next);
  }

  async function pauseFifteenMinutes(): Promise<void> {
    const next = await pauseGuard(15);
    await recordGuardEvent({
      type: "paused",
      host: "*",
      sessionId: decision?.sessionId,
      ruleGroupId: decision?.ruleGroupId,
      ruleGroupName: decision?.ruleGroupName
    });
    setSettings(next);
  }

  return (
    <main className="w-80 overflow-hidden border border-slate-200 bg-white/95 text-slate-800 shadow-soft">
      <header className="flex items-center justify-between border-b border-slate-200 bg-stone-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <BrandMark className="h-7 w-7" />
          <BrandWordmark compact />
        </div>
        <div className="flex items-center gap-1">
          <a
            aria-label={t.welcome.openOptions}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            href={getExtensionUrl("welcome.html")}
            target="_blank"
            rel="noreferrer"
          >
            <Home className="h-5 w-5" />
          </a>
          <button
            aria-label={t.common.openSettings}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            onClick={openOptionsPage}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <section className="px-5 py-5">
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${statusTone(pageContext?.status)}`}>
            {statusIcon(pageContext?.status)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">{t.popup.currentPage}</p>
            <h1 className="mt-1 text-lg font-semibold text-slate-950">{statusCopy?.label ?? t.popup.loadingStatus}</h1>
            <p className="mt-1 truncate text-sm text-slate-600">{hostLabel}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-stone-50/80 p-3">
          <p className="text-sm leading-5 text-slate-600">{statusCopy?.detail ?? t.popup.loadingPlan}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">{t.popup.matchedRuleGroup}</span>
            <span className="max-w-[11rem] truncate text-sm font-medium text-indigo-800">
              {pageContext?.matchedRuleGroupName ?? t.popup.noMatchedRuleGroup}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard label={t.popup.todayBlocked} value={stats?.todayBlocked ?? 0} />
          <StatCard label={t.popup.todayUnlocked} value={stats?.todayUnlocked ?? 0} />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-stone-50/80 p-4">
        <label className="mb-3 block">
          <span className="mb-2 block text-xs font-medium text-slate-500">{t.popup.addToRuleGroupLabel}</span>
          <select
            className="field py-2 text-sm"
            disabled={!settings?.ruleGroups.length}
            value={targetGroup?.id ?? ""}
            onChange={(event) => setSelectedGroupId(event.target.value)}
          >
            {settings?.ruleGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          disabled={!canAddCurrentSite}
          onClick={() => void addCurrentSite()}
        >
          {currentGroupContainsHost ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {currentGroupContainsHost ? t.popup.alreadyInRuleGroup : t.popup.addToGroup(targetGroup?.name ?? t.common.ruleGroupFallback)}
        </button>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {settings && pageContext ? statusSummary(settings, pageContext.activeRuleGroupCount, pageContext.upcomingRuleGroupCount, locale, t) : t.popup.loadingPlan}
        </p>
      </section>

      <footer className="flex items-center justify-between gap-3 p-4">
        <button
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          onClick={() => void pauseFifteenMinutes()}
        >
          <Power className="h-4 w-4" />
          {t.popup.pauseFifteenMinutes}
        </button>
        <a
          className="flex items-center gap-1 text-sm text-indigo-700 transition-colors hover:text-indigo-600"
          href={getExtensionUrl(
            `block.html?site=${encodeURIComponent(host ?? "")}${
              (decision?.ruleGroupId ?? targetGroup?.id) ? `&group=${encodeURIComponent(decision?.ruleGroupId ?? targetGroup?.id ?? "")}` : ""
            }`
          )}
          target="_blank"
          rel="noreferrer"
        >
          <ShieldAlert className="h-4 w-4" />
          {t.popup.previewBlockPage}
        </a>
      </footer>
    </main>
  );
}

function statusTone(status: string | undefined): string {
  if (status === "blocked") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (status === "upcoming") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (status === "unlocked" || status === "outside_schedule") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-indigo-200 bg-indigo-50 text-indigo-600";
}

function statusIcon(status: string | undefined): JSX.Element {
  if (status === "blocked") {
    return <ShieldAlert className="h-6 w-6" />;
  }
  if (status === "upcoming") {
    return <Bell className="h-6 w-6" />;
  }
  if (status === "unlocked" || status === "outside_schedule") {
    return <CheckCircle2 className="h-6 w-6" />;
  }
  return <Clock className="h-6 w-6" />;
}

function StatCard({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-950">{value}</div>
    </div>
  );
}

function statusSummary(
  settings: AppSettings,
  activeCount: number,
  upcomingCount: number,
  locale: SupportedLocale,
  t: LocaleCatalog
): string {
  if (!settings.onboardingCompleted) {
    return t.popup.onboardingNeeded;
  }

  if (settings.pauseUntil && new Date(settings.pauseUntil).getTime() > Date.now()) {
    return t.popup.pausedRemaining(formatDuration(new Date(settings.pauseUntil).getTime() - Date.now(), locale));
  }

  if (activeCount > 0) {
    return t.popup.activeSummary(activeCount, upcomingCount);
  }
  const enabled = settings.ruleGroups.filter((group) => group.enabled);
  return t.popup.enabledSummary(enabled.length);
}

createRoot(document.getElementById("root")!).render(<PopupApp />);
