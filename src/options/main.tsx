import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  Bell,
  Clock,
  Database,
  Moon,
  Plus,
  Save,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  Unlock
} from "lucide-react";
import "../styles/global.css";
import { DEFAULT_SETTINGS } from "../shared/defaults";
import { buildStatsSummary } from "../shared/stats";
import { clearGuardData, getAppSettings, getGuardEvents, saveAppSettings } from "../shared/storage";
import { createSiteRule } from "../shared/sites";
import type { AppSettings, BlockMode, GuardEvent, Weekday } from "../shared/types";

const WEEKDAYS: Array<{ value: Weekday; label: string }> = [
  { value: 1, label: "一" },
  { value: 2, label: "二" },
  { value: 3, label: "三" },
  { value: 4, label: "四" },
  { value: 5, label: "五" },
  { value: 6, label: "六" },
  { value: 0, label: "日" }
];

const BLOCK_MODES: Array<{ value: BlockMode; label: string; note: string }> = [
  { value: "gentle", label: "温和", note: "不限解锁，保留提醒和边界。" },
  { value: "standard", label: "标准", note: "每晚 3 次解锁，适合默认使用。" },
  { value: "strict", label: "严格", note: "每晚 1 次解锁，冷静期更有重量。" }
];

function OptionsApp(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [events, setEvents] = useState<GuardEvent[]>([]);
  const [draftSite, setDraftSite] = useState("");
  const [saved, setSaved] = useState(false);
  const onboardingRequested = useMemo(() => new URLSearchParams(window.location.search).get("onboarding") === "1", []);
  const isOnboarding = onboardingRequested || !settings.onboardingCompleted;
  const stats = useMemo(() => buildStatsSummary(events, settings.schedule), [events, settings.schedule]);

  useEffect(() => {
    void Promise.all([getAppSettings(), getGuardEvents()]).then(([nextSettings, nextEvents]) => {
      setSettings(nextSettings);
      setEvents(nextEvents);
    });
  }, []);

  async function persist(next = settings): Promise<void> {
    const normalized = {
      ...next,
      unlockMinutes: clampNumber(next.unlockMinutes, 1, 60),
      reminderMinutes: clampNumber(next.reminderMinutes, 0, 120),
      maxUnlocksPerNight: next.blockMode === "gentle" ? 0 : clampNumber(next.maxUnlocksPerNight, 1, 10),
      onboardingCompleted: true
    };
    await saveAppSettings(normalized);
    setSettings(normalized);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  function addSite(): void {
    const rule = createSiteRule(draftSite);
    if (!rule) {
      return;
    }
    const exists = settings.sites.some((site) => site.host === rule.host);
    const next = exists ? settings : { ...settings, sites: [...settings.sites, rule] };
    setDraftSite("");
    void persist(next);
  }

  function setMode(mode: BlockMode): void {
    const maxUnlocksPerNight = mode === "gentle" ? 0 : mode === "strict" ? 1 : 3;
    const unlockMinutes = mode === "strict" ? 5 : 10;
    setSettings({ ...settings, blockMode: mode, maxUnlocksPerNight, unlockMinutes });
  }

  function toggleDay(day: Weekday): void {
    const exists = settings.schedule.days.includes(day);
    const days = exists
      ? settings.schedule.days.filter((value) => value !== day)
      : [...settings.schedule.days, day].sort((a, b) => a - b);
    setSettings({ ...settings, schedule: { ...settings.schedule, days } });
  }

  async function clearData(): Promise<void> {
    await clearGuardData();
    const [nextSettings, nextEvents] = await Promise.all([getAppSettings(), getGuardEvents()]);
    setSettings(nextSettings);
    setEvents(nextEvents);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10">
              <Moon className="h-7 w-7 text-indigo-300" />
            </div>
            <div>
              <p className="text-sm text-slate-400">GoodNight Guard</p>
              <h1 className="text-2xl font-bold text-white">{isOnboarding ? "完成晚安边界初始设置" : "晚安边界设置"}</h1>
            </div>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            onClick={() => void persist()}
          >
            <Save className="h-4 w-4" />
            {saved ? "已保存" : isOnboarding ? "完成设置" : "保存设置"}
          </button>
        </header>

        {isOnboarding && (
          <section className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-4 text-sm text-indigo-100">
            先设定今晚的边界：睡眠时间、提醒提前量、容易熬夜的网站和解锁强度。保存后，插件会在晚安时间自动执行这些规则。
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <Panel icon={<Clock className="h-5 w-5" />} title="睡眠计划">
              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
                <span>
                  <span className="block font-medium text-white">启用晚安模式</span>
                  <span className="text-sm text-slate-500">到点后阻断列表中的网站。</span>
                </span>
                <input
                  checked={settings.schedule.enabled}
                  className="h-5 w-5 accent-indigo-500"
                  type="checkbox"
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      schedule: { ...settings.schedule, enabled: event.target.checked }
                    })
                  }
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="开始时间">
                  <input
                    className="field"
                    type="time"
                    value={settings.schedule.startTime}
                    onChange={(event) =>
                      setSettings({ ...settings, schedule: { ...settings.schedule, startTime: event.target.value } })
                    }
                  />
                </Field>
                <Field label="结束时间">
                  <input
                    className="field"
                    type="time"
                    value={settings.schedule.endTime}
                    onChange={(event) =>
                      setSettings({ ...settings, schedule: { ...settings.schedule, endTime: event.target.value } })
                    }
                  />
                </Field>
                <Field label="提前提醒">
                  <select
                    className="field"
                    value={settings.reminderMinutes}
                    onChange={(event) => setSettings({ ...settings, reminderMinutes: Number(event.target.value) })}
                  >
                    <option value={15}>提前 15 分钟</option>
                    <option value={30}>提前 30 分钟</option>
                    <option value={60}>提前 60 分钟</option>
                  </select>
                </Field>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-300">重复日期</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.value}
                      className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${
                        settings.schedule.days.includes(day.value)
                          ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                          : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500"
                      }`}
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel icon={<ShieldAlert className="h-5 w-5" />} title="网站规则">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="field min-w-0 flex-1"
                  placeholder="例如 youtube.com"
                  value={draftSite}
                  onChange={(event) => setDraftSite(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      addSite();
                    }
                  }}
                />
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-500" onClick={addSite}>
                  <Plus className="h-4 w-4" />
                  添加
                </button>
              </div>

              <div className="divide-y divide-slate-800 overflow-hidden rounded-lg border border-slate-800">
                {settings.sites.map((site) => (
                  <div key={site.id} className="flex items-center justify-between gap-3 bg-slate-950 px-4 py-3">
                    <span className="truncate text-sm text-slate-200">{site.host}</span>
                    <button
                      aria-label={`删除 ${site.host}`}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                      onClick={() => setSettings({ ...settings, sites: settings.sites.filter((item) => item.id !== site.id) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel icon={<SlidersHorizontal className="h-5 w-5" />} title="阻断强度">
              <div className="grid gap-3 sm:grid-cols-3">
                {BLOCK_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      settings.blockMode === mode.value
                        ? "border-indigo-400 bg-indigo-500/15 text-white"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600"
                    }`}
                    onClick={() => setMode(mode.value)}
                  >
                    <span className="block font-semibold">{mode.label}</span>
                    <span className="mt-2 block text-xs leading-5 text-slate-500">{mode.note}</span>
                  </button>
                ))}
              </div>
            </Panel>
          </section>

          <aside className="space-y-6">
            <Panel icon={<Unlock className="h-5 w-5" />} title="解锁设置">
              <Field label="临时解锁时长">
                <input
                  className="field"
                  min={1}
                  max={60}
                  type="number"
                  value={settings.unlockMinutes}
                  onChange={(event) => setSettings({ ...settings, unlockMinutes: Number(event.target.value) })}
                />
              </Field>
              <Field label="每晚最大解锁次数">
                <input
                  className="field"
                  disabled={settings.blockMode === "gentle"}
                  min={1}
                  max={10}
                  type="number"
                  value={settings.blockMode === "gentle" ? 0 : settings.maxUnlocksPerNight}
                  onChange={(event) => setSettings({ ...settings, maxUnlocksPerNight: Number(event.target.value) })}
                />
              </Field>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm">
                <span>记录解锁原因</span>
                <input
                  checked={settings.recordUnlockReason}
                  className="h-5 w-5 accent-indigo-500"
                  type="checkbox"
                  onChange={(event) => setSettings({ ...settings, recordUnlockReason: event.target.checked })}
                />
              </label>
              <Field label="承诺语">
                <textarea
                  className="field min-h-32 resize-y"
                  value={settings.commitment}
                  onChange={(event) => setSettings({ ...settings, commitment: event.target.value })}
                />
              </Field>
            </Panel>

            <Panel icon={<BarChart3 className="h-5 w-5" />} title="数据统计">
              <div className="grid grid-cols-2 gap-3">
                <Metric label="今晚阻断" value={stats.tonightBlocked} />
                <Metric label="今晚解锁" value={stats.tonightUnlocked} />
                <Metric label="今日阻断" value={stats.todayBlocked} />
                <Metric label="今日解锁" value={stats.todayUnlocked} />
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                <p className="mb-3 text-sm font-medium text-slate-300">最常被阻断</p>
                {stats.topBlockedHosts.length === 0 ? (
                  <p className="text-sm text-slate-500">还没有阻断记录。</p>
                ) : (
                  <ul className="space-y-2 text-sm text-slate-400">
                    {stats.topBlockedHosts.map((host) => (
                      <li key={host.host} className="flex justify-between gap-4">
                        <span className="truncate">{host.host}</span>
                        <span>{host.count} 次</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Panel>

            <Panel icon={<Bell className="h-5 w-5" />} title="提醒与隐私">
              <p className="text-sm leading-6 text-slate-400">
                插件只在本地保存设置、域名级事件和解锁原因，不记录页面标题、完整浏览历史或网页内容。
              </p>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-500/20"
                onClick={() => void clearData()}
              >
                <Database className="h-4 w-4" />
                清空统计与临时状态
              </button>
            </Panel>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-night">
      <div className="mb-5 flex items-center gap-2 text-indigo-300">
        {icon}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

createRoot(document.getElementById("root")!).render(<OptionsApp />);
