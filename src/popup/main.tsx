import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bell, Clock, Moon, Plus, Power, Settings, ShieldAlert } from "lucide-react";
import "../styles/global.css";
import { getActiveTabUrl, getExtensionUrl, openOptionsPage } from "../shared/browser";
import { buildStatsSummary } from "../shared/stats";
import { addSiteRule, getAppSettings, getGuardEvents, pauseGuard, recordGuardEvent } from "../shared/storage";
import { createSiteRule, evaluateAccess, extractHostnameFromUrl } from "../shared/sites";
import { evaluateReminder, formatDuration, isScheduleActive, parseClockTime } from "../shared/time";
import type { AppSettings, GuardEvent } from "../shared/types";

function PopupApp(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>();
  const [events, setEvents] = useState<GuardEvent[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>();

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
  const isActive = settings ? isScheduleActive(settings.schedule) : false;
  const reminder = settings
    ? evaluateReminder(settings.schedule, settings.reminderMinutes, settings.remindedSessionIds)
    : undefined;
  const stats = settings ? buildStatsSummary(events, settings.schedule) : undefined;

  async function addCurrentSite(): Promise<void> {
    const rule = createSiteRule(host);
    if (!rule) {
      return;
    }
    const next = await addSiteRule(rule);
    await recordGuardEvent({ type: "site_added", host: rule.host });
    setSettings(next);
  }

  async function pauseFifteenMinutes(): Promise<void> {
    const next = await pauseGuard(15);
    await recordGuardEvent({ type: "paused", host: "*", sessionId: decision?.sessionId });
    setSettings(next);
  }

  return (
    <main className="w-80 overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 shadow-night">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-indigo-400" />
          <span className="text-base font-bold">晚安边界</span>
        </div>
        <button
          aria-label="打开设置"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          onClick={openOptionsPage}
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      <section className="px-5 py-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/10">
          {reminder?.shouldRemind ? <Bell className="h-8 w-8 text-amber-300" /> : <Clock className="h-8 w-8 text-indigo-300" />}
        </div>
        <h1 className="text-lg font-semibold text-white">
          {isActive ? "晚安模式已开启" : reminder?.shouldRemind ? "晚安模式即将开启" : "晚安模式未开启"}
        </h1>
        <p className="mt-1 text-sm text-slate-400">{settings ? scheduleCopy(settings) : "正在读取计划..."}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatCard label="今晚阻断" value={stats?.tonightBlocked ?? 0} />
          <StatCard label="今晚解锁" value={stats?.tonightUnlocked ?? 0} />
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-950/50 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">当前网站</p>
            <p className="truncate text-sm font-medium text-slate-100">{host}</p>
          </div>
          <span className={`shrink-0 rounded-md border px-2 py-1 text-xs ${decision?.allowed === false ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
            {decision?.allowed === false ? "会阻断" : "未阻断"}
          </span>
        </div>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          onClick={() => void addCurrentSite()}
        >
          <Plus className="h-4 w-4" />
          加入睡眠阻断列表
        </button>
      </section>

      <footer className="flex items-center justify-between gap-3 p-4">
        <button
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          onClick={() => void pauseFifteenMinutes()}
        >
          <Power className="h-4 w-4" />
          暂停 15 分钟
        </button>
        <a
          className="flex items-center gap-1 text-sm text-indigo-300 transition-colors hover:text-indigo-200"
          href={getExtensionUrl(`block.html?site=${encodeURIComponent(host)}`)}
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

function StatCard({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function scheduleCopy(settings: AppSettings): string {
  if (!settings.onboardingCompleted) {
    return "请先完成初始设置";
  }

  if (!settings.schedule.enabled) {
    return "计划已关闭";
  }

  if (settings.pauseUntil && new Date(settings.pauseUntil).getTime() > Date.now()) {
    return `已暂停，还剩 ${formatDuration(new Date(settings.pauseUntil).getTime() - Date.now())}`;
  }

  const start = parseClockTime(settings.schedule.startTime);
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const delta = (start - minutesNow + 1440) % 1440;
  return isScheduleActive(settings.schedule)
    ? `直到 ${settings.schedule.endTime} 前保持边界`
    : `距离开始还有 ${formatDuration(delta * 60000)}`;
}

createRoot(document.getElementById("root")!).render(<PopupApp />);
