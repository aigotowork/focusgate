import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AlertCircle, Check, Flame, Focus, Moon, ShieldAlert, Unlock, Waves } from "lucide-react";
import "../styles/global.css";
import {
  buildSandboxedCustomHtml,
  canRenderCustomHtml,
  getDefaultBlockPageForRuleGroup,
  getExecutableExternalUrl,
  normalizeBlockPageConfig
} from "../shared/block-page";
import { BRAND } from "../shared/brand";
import { BrandMark, BrandWordmark } from "../shared/brand-ui";
import { addUnlockSession, getAppSettings, getGuardEvents, recordGuardEvent } from "../shared/storage";
import { evaluateUnlockLimit, getRuleGroupById } from "../shared/sites";
import type { AppSettings, BlockPageConfig, BlockPageTone, GuardEvent, RuleGroup, UnlockReason } from "../shared/types";

const CONFIRM_TEXT = "我知道正在突破边界，但我选择解锁";

function BlockApp(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>();
  const [unlockStep, setUnlockStep] = useState<0 | 1 | 2>(0);
  const [countdown, setCountdown] = useState(10);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState<UnlockReason>("work");
  const [events, setEvents] = useState<GuardEvent[]>([]);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const site = params.get("site") ?? "这个网站";
  const target = params.get("target");
  const ruleGroupId = params.get("group") ?? undefined;
  const activeGroup = settings ? getRuleGroupById(settings, ruleGroupId) ?? settings.ruleGroups[0] : undefined;
  const blockPage = activeGroup
    ? normalizeBlockPageConfig(activeGroup.blockPage, getDefaultBlockPageForRuleGroup(activeGroup))
    : undefined;
  const tone = getToneView(blockPage?.tone ?? "sleep");

  useEffect(() => {
    void Promise.all([getAppSettings(), getGuardEvents()]).then(([nextSettings, nextEvents]) => {
      setSettings(nextSettings);
      setEvents(nextEvents);
    });
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
    if (activeGroup && !evaluateUnlockLimit(activeGroup, events).allowed) {
      setUnlockStep(2);
      return;
    }
    setCountdown(10);
    setUnlockStep(1);
  }

  async function confirmUnlock(): Promise<void> {
    if (!settings || !activeGroup || confirmation.trim() !== CONFIRM_TEXT) {
      return;
    }

    const unlockLimit = evaluateUnlockLimit(activeGroup, events);
    if (!unlockLimit.allowed) {
      return;
    }

    const now = new Date();
    await addUnlockSession({
      ruleGroupId: activeGroup.id,
      host: site,
      unlockedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + activeGroup.unlockMinutes * 60000).toISOString(),
      durationMinutes: activeGroup.unlockMinutes,
      reason: activeGroup.recordUnlockReason ? reason : undefined,
      mode: activeGroup.blockMode,
      sessionId: unlockLimit.sessionId
    });
    await recordGuardEvent({
      type: "unlocked",
      host: site,
      sessionId: unlockLimit.sessionId,
      ruleGroupId: activeGroup.id,
      ruleGroupName: activeGroup.name,
      reason: activeGroup.recordUnlockReason ? reason : undefined
    });

    if (target) {
      window.location.href = target;
      return;
    }

    window.close();
  }

  function runPrimaryAction(): void {
    if (!blockPage) {
      window.close();
      return;
    }

    const action = blockPage.primaryAction;
    if (action.type === "external_url") {
      const externalUrl = getExecutableExternalUrl(action);
      if (externalUrl) {
        window.location.href = externalUrl;
        return;
      }
    }

    if (action.type === "handoff_html" && activeGroup) {
      window.location.href = `handoff.html?site=${encodeURIComponent(site)}&group=${encodeURIComponent(activeGroup.id)}`;
      return;
    }

    window.close();
  }

  return (
    <main className={`flex min-h-screen items-center justify-center px-5 py-10 text-slate-800 ${tone.background}`}>
      <section className="w-full max-w-3xl text-center">
        <div className="mb-8 flex items-center justify-center gap-2 text-slate-500">
          <BrandMark className="h-8 w-8" />
          <BrandWordmark compact />
        </div>
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border ${tone.iconShell}`}>
          <tone.Icon className={`h-11 w-11 ${tone.icon}`} />
        </div>

        <p className={`mb-2 text-sm font-medium ${tone.accent}`}>{activeGroup?.name ?? BRAND.nameZh}</p>
        <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
          {blockPage?.title ?? "现在是限制时间"}
        </h1>
        <p className="mt-3 text-xl text-slate-500">{new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-6 text-left shadow-soft">
          <div className={`mb-5 flex items-center justify-center gap-2 ${tone.warning}`}>
            <ShieldAlert className="h-5 w-5" />
            <span className="text-sm font-medium">已拦截访问：{site}</span>
          </div>

          {activeGroup && blockPage ? (
            <BlockPageBody group={activeGroup} page={blockPage} site={site} tone={tone} />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-stone-50 p-5 text-center">
              <p className="text-sm text-slate-500">正在读取阻断规则。</p>
            </div>
          )}
        </div>

        <div className="mx-auto mt-8 max-w-md">
          {unlockStep === 0 && (
            <div className="space-y-4">
              <button
                className="w-full rounded-xl bg-indigo-600 px-5 py-4 text-lg font-semibold text-white shadow-soft transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                onClick={runPrimaryAction}
              >
                {blockPage?.primaryActionLabel ?? "关闭页面"}
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
                onClick={startUnlock}
              >
                <Unlock className="h-4 w-4" />
                {unlockLabel(activeGroup, events)}
              </button>
            </div>
          )}

          {unlockStep === 1 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-slate-600">请深呼吸，冷静一下...</p>
              <p className="mt-2 text-4xl font-bold text-indigo-700">{countdown}s</p>
            </div>
          )}

          {unlockStep === 2 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-soft">
              {activeGroup && !evaluateUnlockLimit(activeGroup, events).allowed && (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  本周期的临时解锁次数已经用完。建议现在关掉网页，让这条边界继续生效。
                </div>
              )}
              {activeGroup?.recordUnlockReason && (
                <label className="mb-4 block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">解锁原因</span>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={reason}
                    onChange={(event) => setReason(event.target.value as UnlockReason)}
                  >
                    <option value="work">工作需要</option>
                    <option value="study">学习资料</option>
                    <option value="urgent">紧急事项</option>
                    <option value="other">其他原因</option>
                  </select>
                </label>
              )}
              <p className="mb-3 text-sm text-slate-600">为了确认你真的需要解锁，请输入：</p>
              <p className="mb-4 select-all rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm font-medium text-indigo-900">
                {CONFIRM_TEXT}
              </p>
              <input
                className="mb-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="请输入上方文字"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-stone-50"
                  onClick={() => setUnlockStep(0)}
                >
                  算了，保持边界
                </button>
                <button
                  className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={confirmation.trim() !== CONFIRM_TEXT || Boolean(activeGroup && !evaluateUnlockLimit(activeGroup, events).allowed)}
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

function unlockLabel(group: RuleGroup | undefined, events: GuardEvent[]): string {
  if (!group) {
    return "临时解锁 10 分钟";
  }

  const decision = evaluateUnlockLimit(group, events);
  if (!decision.allowed) {
    return "本周期解锁次数已用完";
  }

  const remaining = decision.limit <= 0 ? "不限次数" : `剩余 ${decision.limit - decision.used} 次`;
  return `临时解锁 ${group.unlockMinutes} 分钟（${remaining}）`;
}

type ToneView = {
  Icon: typeof Moon;
  accent: string;
  background: string;
  icon: string;
  iconShell: string;
  warning: string;
  positiveTitle: string;
  positiveItems: string[];
  costTitle: string;
  costItems: string[];
};

function BlockPageBody({
  group,
  page,
  site,
  tone
}: {
  group: RuleGroup;
  page: BlockPageConfig;
  site: string;
  tone: ToneView;
}): JSX.Element {
  const currentTime = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

  if (canRenderCustomHtml(page)) {
    return (
      <div className="space-y-5">
        <iframe
          className="min-h-[320px] w-full rounded-xl border border-slate-200 bg-white"
          sandbox=""
          srcDoc={buildSandboxedCustomHtml(page.customHtml, {
            groupName: group.name,
            site,
            commitment: group.commitment,
            unlockMinutes: group.unlockMinutes,
            time: currentTime
          })}
          title={`${group.name} 自定义阻断页`}
        />
        <CommitmentCard group={group} />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-stone-50 p-5 text-center">
        <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600">{page.description}</p>
        <CommitmentCard group={group} compact />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <InfoList
          icon={<Check className="h-4 w-4 text-emerald-400" />}
          title={tone.positiveTitle}
          items={tone.positiveItems}
        />
        <InfoList
          icon={<AlertCircle className="h-4 w-4 text-rose-400" />}
          title={tone.costTitle}
          items={tone.costItems}
        />
      </div>
    </>
  );
}

function CommitmentCard({ group, compact = false }: { group: RuleGroup; compact?: boolean }): JSX.Element {
  return (
    <div className={`${compact ? "mt-4" : ""} rounded-xl border border-indigo-100 bg-indigo-50/70 p-5 text-center`}>
      <p className="text-sm text-slate-500">当前规则组承诺语：</p>
      <p className="mt-2 text-lg font-medium text-indigo-900">“{group.commitment}”</p>
    </div>
  );
}

function getToneView(tone: BlockPageTone): ToneView {
  const views: Record<BlockPageTone, ToneView> = {
    sleep: {
      Icon: Moon,
      accent: "text-indigo-700",
      background: "bg-gradient-to-br from-indigo-50 via-stone-50 to-white",
      icon: "text-indigo-700",
      iconShell: "border-indigo-200 bg-indigo-50",
      warning: "text-rose-700",
      positiveTitle: "现在收束的好处",
      positiveItems: ["明天早晨更清醒", "情绪更稳定", "更容易守住明天的计划"],
      costTitle: "继续浏览的代价",
      costItems: ["起床更困难", "注意力下降", "更容易陷入拖延焦虑"]
    },
    focus: {
      Icon: Focus,
      accent: "text-sky-700",
      background: "bg-gradient-to-br from-sky-50 via-stone-50 to-white",
      icon: "text-sky-700",
      iconShell: "border-sky-200 bg-sky-50",
      warning: "text-amber-700",
      positiveTitle: "现在离开的好处",
      positiveItems: ["注意力回到主线", "工作节奏不被切碎", "更容易完成今天的重要事项"],
      costTitle: "继续浏览的代价",
      costItems: ["时间被短内容吞掉", "切回任务更困难", "下一个计划被继续推迟"]
    },
    calm: {
      Icon: Waves,
      accent: "text-emerald-700",
      background: "bg-gradient-to-br from-emerald-50 via-stone-50 to-white",
      icon: "text-emerald-700",
      iconShell: "border-emerald-200 bg-emerald-50",
      warning: "text-emerald-700",
      positiveTitle: "保持边界的好处",
      positiveItems: ["减少冲动切换", "把精力留给重要的事", "让规则继续稳定生效"],
      costTitle: "突破边界的代价",
      costItems: ["更容易形成例外", "规则可信度下降", "后续选择会更费力"]
    },
    strict: {
      Icon: Flame,
      accent: "text-rose-700",
      background: "bg-gradient-to-br from-rose-50 via-stone-50 to-white",
      icon: "text-rose-700",
      iconShell: "border-rose-200 bg-rose-50",
      warning: "text-rose-700",
      positiveTitle: "现在停下的好处",
      positiveItems: ["立即切断高风险入口", "保留最后的执行力", "让严格规则真正有用"],
      costTitle: "继续访问的代价",
      costItems: ["更容易连续破戒", "解锁次数很快耗尽", "当前目标会被迫让位"]
    }
  };

  return views[tone];
}

function InfoList({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }): JSX.Element {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        {icon}
        {title}
      </h2>
      <ul className="space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<BlockApp />);
