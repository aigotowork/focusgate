import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import "../styles/global.css";
import {
  buildSandboxedCustomHtml,
  canRenderHandoffHtml,
  getDefaultBlockPageForRuleGroup,
  normalizeBlockPageConfig
} from "../shared/block-page";
import { BRAND } from "../shared/brand";
import { BrandMark, BrandWordmark } from "../shared/brand-ui";
import { formatTime, getCatalog, getLocaleFromSettings } from "../shared/i18n";
import { getAppSettings } from "../shared/storage";
import { getRuleGroupById } from "../shared/sites";
import type { AppSettings, RuleGroup } from "../shared/types";

function HandoffApp(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const site = params.get("site") ?? "这个网站";
  const ruleGroupId = params.get("group") ?? undefined;
  const group = settings ? getRuleGroupById(settings, ruleGroupId) ?? settings.ruleGroups[0] : undefined;
  const locale = settings ? getLocaleFromSettings(settings) : "zh-CN";
  const t = getCatalog(locale);
  const blockPage = group ? normalizeBlockPageConfig(group.blockPage, getDefaultBlockPageForRuleGroup(group, locale)) : undefined;
  const action = blockPage?.primaryAction;
  const currentTime = formatTime(new Date(), locale);

  useEffect(() => {
    void getAppSettings().then(setSettings);
  }, []);

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2 text-slate-500">
              <BrandMark className="h-8 w-8" />
              <BrandWordmark compact />
            </div>
            <p className="text-sm font-medium text-indigo-700">{group?.name ?? BRAND.nameZh}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              {action?.handoffTitle ?? t.handoff.fallbackTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {t.handoff.leftSite(site)}
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            {t.common.back}
          </button>
        </header>

        {group && action && canRenderHandoffHtml(action) ? (
          <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-soft">
            <iframe
              className="min-h-[520px] w-full rounded-lg border border-slate-200 bg-white"
              sandbox=""
              srcDoc={buildSandboxedCustomHtml(action.handoffHtml, {
                groupName: group.name,
                site,
                commitment: group.commitment,
                unlockMinutes: group.unlockMinutes,
                time: currentTime
              })}
              title={t.handoff.iframeTitle(group.name)}
            />
          </section>
        ) : (
          <EmptyState group={group} t={t} />
        )}
      </div>
    </main>
  );
}

function EmptyState({ group, t }: { group: RuleGroup | undefined; t: ReturnType<typeof getCatalog> }): JSX.Element {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-8 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50">
        <FileText className="h-7 w-7 text-indigo-600" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-950">{t.handoff.emptyTitle}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        {t.handoff.emptyBody}
      </p>
      <div className="mx-auto mt-6 max-w-md rounded-lg border border-indigo-100 bg-indigo-50/70 p-4 text-left">
        <p className="text-xs text-slate-500">{t.common.currentRuleGroup}</p>
        <p className="mt-1 font-medium text-indigo-900">{group?.name ?? t.common.loading}</p>
      </div>
      <a
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        href="options.html"
      >
        <ExternalLink className="h-4 w-4" />
        {t.handoff.openSettings}
      </a>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(<HandoffApp />);
