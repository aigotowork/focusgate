import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Clock, Moon, Plus, Save, ShieldAlert, Trash2, Unlock } from "lucide-react";
import "../styles/global.css";
import { DEFAULT_SETTINGS } from "../shared/defaults";
import { getAppSettings, saveAppSettings } from "../shared/storage";
import { createSiteRule } from "../shared/sites";
import type { AppSettings, Weekday } from "../shared/types";

const WEEKDAYS: Array<{ value: Weekday; label: string }> = [
  { value: 1, label: "一" },
  { value: 2, label: "二" },
  { value: 3, label: "三" },
  { value: 4, label: "四" },
  { value: 5, label: "五" },
  { value: 6, label: "六" },
  { value: 0, label: "日" }
];

function OptionsApp(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [draftSite, setDraftSite] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getAppSettings().then(setSettings);
  }, []);

  async function persist(next = settings): Promise<void> {
    await saveAppSettings(next);
    setSettings(next);
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

  function toggleDay(day: Weekday): void {
    const exists = settings.schedule.days.includes(day);
    const days = exists
      ? settings.schedule.days.filter((value) => value !== day)
      : [...settings.schedule.days, day].sort((a, b) => a - b);
    setSettings({ ...settings, schedule: { ...settings.schedule, days } });
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
              <h1 className="text-2xl font-bold text-white">晚安边界设置</h1>
            </div>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            onClick={() => void persist()}
          >
            <Save className="h-4 w-4" />
            {saved ? "已保存" : "保存设置"}
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
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

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="开始时间">
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    type="time"
                    value={settings.schedule.startTime}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        schedule: { ...settings.schedule, startTime: event.target.value }
                      })
                    }
                  />
                </Field>
                <Field label="结束时间">
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    type="time"
                    value={settings.schedule.endTime}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        schedule: { ...settings.schedule, endTime: event.target.value }
                      })
                    }
                  />
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
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例如 youtube.com"
                  value={draftSite}
                  onChange={(event) => setDraftSite(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      addSite();
                    }
                  }}
                />
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
                  onClick={addSite}
                >
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
          </section>

          <aside className="space-y-6">
            <Panel icon={<Unlock className="h-5 w-5" />} title="解锁摩擦">
              <Field label="临时解锁时长">
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min={1}
                  max={60}
                  type="number"
                  value={settings.unlockMinutes}
                  onChange={(event) => setSettings({ ...settings, unlockMinutes: Number(event.target.value) })}
                />
              </Field>
              <Field label="承诺语">
                <textarea
                  className="min-h-32 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={settings.commitment}
                  onChange={(event) => setSettings({ ...settings, commitment: event.target.value })}
                />
              </Field>
            </Panel>
          </aside>
        </div>
      </div>
    </main>
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

createRoot(document.getElementById("root")!).render(<OptionsApp />);
