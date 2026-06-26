import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertCircle, Check, Moon, ShieldAlert, Unlock } from "lucide-react";
import "../styles/global.css";
import { addUnlockSession, getAppSettings, recordGuardEvent } from "../shared/storage";
import type { AppSettings } from "../shared/types";

const CONFIRM_TEXT = "我知道熬夜不好，但我选择解锁";

function BlockApp(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>();
  const [unlockStep, setUnlockStep] = useState<0 | 1 | 2>(0);
  const [countdown, setCountdown] = useState(10);
  const [confirmation, setConfirmation] = useState("");

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const site = params.get("site") ?? "这个网站";
  const target = params.get("target");

  useEffect(() => {
    void getAppSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (unlockStep !== 1) {
      return;
    }

    if (countdown <= 0) {
      setUnlockStep(2);
      return;
    }

    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, unlockStep]);

  function startUnlock(): void {
    setCountdown(10);
    setUnlockStep(1);
  }

  async function confirmUnlock(): Promise<void> {
    if (!settings || confirmation.trim() !== CONFIRM_TEXT) {
      return;
    }

    await addUnlockSession({
      host: site,
      expiresAt: new Date(Date.now() + settings.unlockMinutes * 60000).toISOString()
    });
    await recordGuardEvent({ type: "unlocked", host: site });

    if (target) {
      window.location.href = target;
      return;
    }

    window.close();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-slate-200">
      <section className="w-full max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/10">
          <Moon className="h-11 w-11 text-indigo-300" />
        </div>

        <p className="mb-2 text-sm font-medium text-indigo-300">GoodNight Guard</p>
        <h1 className="text-4xl font-bold tracking-normal text-white sm:text-5xl">现在是晚安时间</h1>
        <p className="mt-3 text-xl text-slate-400">{new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-left shadow-night">
          <div className="mb-5 flex items-center justify-center gap-2 text-rose-300">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-sm font-medium">已拦截访问：{site}</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-center">
            <p className="text-sm text-slate-500">这是白天的你为今晚设置的边界：</p>
            <p className="mt-2 text-lg font-medium text-indigo-100">“{settings?.commitment ?? "明天早上的我，会感谢现在睡觉的我。"}”</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoList
              icon={<Check className="h-4 w-4 text-emerald-400" />}
              title="现在睡觉的好处"
              items={["明天早晨更清醒", "情绪更稳定", "更容易守住明天的计划"]}
            />
            <InfoList
              icon={<AlertCircle className="h-4 w-4 text-rose-400" />}
              title="继续熬夜的代价"
              items={["起床更困难", "注意力下降", "更容易陷入拖延焦虑"]}
            />
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-md">
          {unlockStep === 0 && (
            <div className="space-y-4">
              <button
                className="w-full rounded-xl bg-indigo-600 px-5 py-4 text-lg font-semibold text-white shadow-night transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                onClick={() => window.close()}
              >
                关掉网页，我去睡了
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-900 hover:text-slate-300"
                onClick={startUnlock}
              >
                <Unlock className="h-4 w-4" />
                临时解锁 {settings?.unlockMinutes ?? 10} 分钟
              </button>
            </div>
          )}

          {unlockStep === 1 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-slate-300">请深呼吸，冷静一下...</p>
              <p className="mt-2 text-4xl font-bold text-indigo-300">{countdown}s</p>
            </div>
          )}

          {unlockStep === 2 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-left">
              <p className="mb-3 text-sm text-slate-300">为了确认你真的需要解锁，请输入：</p>
              <p className="mb-4 select-all rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm font-medium text-indigo-200">
                {CONFIRM_TEXT}
              </p>
              <input
                className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="请输入上方文字"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="rounded-lg bg-slate-800 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-700"
                  onClick={() => setUnlockStep(0)}
                >
                  算了，去睡
                </button>
                <button
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 font-medium text-rose-200 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={confirmation.trim() !== CONFIRM_TEXT}
                  onClick={() => void confirmUnlock()}
                >
                  确认解锁
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function InfoList({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }): JSX.Element {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
        {icon}
        {title}
      </h2>
      <ul className="space-y-2 text-sm text-slate-500">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<BlockApp />);
