import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bell, CheckCircle2, Clock, Home, Plus, Power, Settings, ShieldAlert } from "lucide-react";
import "../styles/global.css";
import { BRAND } from "../shared/brand";
import { BrandMark, BrandWordmark } from "../shared/brand-ui";
import { getActiveTabUrl, getExtensionUrl, openOptionsPage } from "../shared/browser";
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
import { formatDuration } from "../shared/time";
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

  const host = useMemo(() => extractHostnameFromUrl(currentUrl ?? "") ?? "当前页面", [currentUrl]);
  const decision = settings && currentUrl ? evaluateAccess(currentUrl, settings) : undefined;
  const pageContext = settings ? getPopupPageContext(settings, currentUrl) : undefined;
  const stats = settings
    ? buildStatsSummary(events, settings.ruleGroups[0]?.schedule ?? { enabled: false, startTime: "00:00", endTime: "00:00", days: [] })
    : undefined;
  const selectedGroup =
    settings && selectedGroupId ? getRuleGroupById(settings, selectedGroupId) : undefined;
  const targetGroup =
    selectedGroup ??
    (settings && pageContext?.selectedRuleGroupId ? getRuleGroupById(settings, pageContext.selectedRuleGroupId) : undefined);
  const currentGroupContainsHost = Boolean(
    host !== "当前页面" && targetGroup?.sites.some((site) => matchesSiteRule(host, site))
  );
  const canAddCurrentSite = Boolean(host !== "当前页面" && targetGroup && !currentGroupContainsHost);

  useEffect(() => {
    if (!settings || !pageContext?.selectedRuleGroupId) {
      return;
    }
    setSelectedGroupId((current) => current ?? pageContext.selectedRuleGroupId);
  }, [pageContext?.selectedRuleGroupId, settings]);

  async function addCurrentSite(): Promise<void> {
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
            aria-label={`打开${BRAND.nameZh}主页`}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            href={getExtensionUrl("welcome.html")}
            target="_blank"
            rel="noreferrer"
          >
            <Home className="h-5 w-5" />
          </a>
          <button
            aria-label="打开设置"
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
            <p className="text-xs font-medium text-slate-500">当前页面</p>
            <h1 className="mt-1 text-lg font-semibold text-slate-950">{pageContext?.statusLabel ?? "正在读取当前状态"}</h1>
            <p className="mt-1 truncate text-sm text-slate-600">{host}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-stone-50/80 p-3">
          <p className="text-sm leading-5 text-slate-600">{pageContext?.statusDetail ?? "正在读取计划..."}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">命中规则组</span>
            <span className="max-w-[11rem] truncate text-sm font-medium text-indigo-800">
              {pageContext?.matchedRuleGroupName ?? "未命中任何规则组"}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard label="今日阻断" value={stats?.todayBlocked ?? 0} />
          <StatCard label="今日解锁" value={stats?.todayUnlocked ?? 0} />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-stone-50/80 p-4">
        <label className="mb-3 block">
          <span className="mb-2 block text-xs font-medium text-slate-500">加入到规则组</span>
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
          {currentGroupContainsHost ? "已在该规则组" : `加入到 ${targetGroup?.name ?? "规则组"}`}
        </button>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {settings && pageContext ? statusCopy(settings, pageContext.activeRuleGroupCount, pageContext.upcomingRuleGroupCount) : "正在读取计划..."}
        </p>
      </section>

      <footer className="flex items-center justify-between gap-3 p-4">
        <button
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          onClick={() => void pauseFifteenMinutes()}
        >
          <Power className="h-4 w-4" />
          暂停 15 分钟
        </button>
        <a
          className="flex items-center gap-1 text-sm text-indigo-700 transition-colors hover:text-indigo-600"
          href={getExtensionUrl(
            `block.html?site=${encodeURIComponent(host)}${
              (decision?.ruleGroupId ?? targetGroup?.id) ? `&group=${encodeURIComponent(decision?.ruleGroupId ?? targetGroup?.id ?? "")}` : ""
            }`
          )}
          target="_blank"
          rel="noreferrer"
        >
          <ShieldAlert className="h-4 w-4" />
          预览阻断页
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

function statusCopy(settings: AppSettings, activeCount: number, upcomingCount: number): string {
  if (!settings.onboardingCompleted) {
    return "请先完成初始设置";
  }

  if (settings.pauseUntil && new Date(settings.pauseUntil).getTime() > Date.now()) {
    return `已暂停，还剩 ${formatDuration(new Date(settings.pauseUntil).getTime() - Date.now())}`;
  }

  if (activeCount > 0) {
    return `${activeCount} 个规则组正在生效，${upcomingCount} 个规则组即将开启`;
  }
  const enabled = settings.ruleGroups.filter((group) => group.enabled);
  return `${enabled.length} 个规则组已启用`;
}

createRoot(document.getElementById("root")!).render(<PopupApp />);
