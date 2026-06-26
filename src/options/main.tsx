import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  Bell,
  Clock,
  Code2,
  Database,
  Eye,
  FileText,
  FileUp,
  Link2,
  Home,
  Languages,
  Palette,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
  Unlock
} from "lucide-react";
import "../styles/global.css";
import { BrandMark, BrandWordmark } from "../shared/brand-ui";
import {
  buildSandboxedCustomHtml,
  canRenderCustomHtml,
  canRenderHandoffHtml,
  getDefaultBlockPageForRuleGroup,
  MAX_CUSTOM_HTML_BYTES,
  normalizeBlockPageConfig,
  normalizePrimaryActionConfig
} from "../shared/block-page";
import { DEFAULT_SETTINGS, createDefaultRuleGroup } from "../shared/defaults";
import {
  SUPPORTED_LOCALES,
  formatTime,
  getCatalog,
  getLocaleFromSettings,
  type LanguagePreference,
  type LocaleCatalog,
  type SupportedLocale
} from "../shared/i18n";
import { buildStatsSummary } from "../shared/stats";
import { clearGuardData, getAppSettings, getGuardEvents, saveAppSettings } from "../shared/storage";
import { createSiteRule } from "../shared/sites";
import type {
  AppSettings,
  BlockMode,
  BlockPageConfig,
  BlockPagePrimaryActionType,
  BlockPageTone,
  GuardEvent,
  RuleGroup,
  Weekday
} from "../shared/types";

const WEEKDAYS: Array<{ value: Weekday; label: string }> = [
  { value: 1, label: "" },
  { value: 2, label: "" },
  { value: 3, label: "" },
  { value: 4, label: "" },
  { value: 5, label: "" },
  { value: 6, label: "" },
  { value: 0, label: "" }
];
const BLOCK_MODE_VALUES: BlockMode[] = ["gentle", "standard", "strict"];
const BLOCK_PAGE_TONE_VALUES: BlockPageTone[] = ["sleep", "focus", "calm", "strict"];
const PRIMARY_ACTION_VALUES: BlockPagePrimaryActionType[] = ["close", "external_url", "handoff_html"];

function OptionsApp(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [events, setEvents] = useState<GuardEvent[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(DEFAULT_SETTINGS.ruleGroups[0].id);
  const [draftSite, setDraftSite] = useState("");
  const [saved, setSaved] = useState(false);
  const onboardingRequested = useMemo(() => new URLSearchParams(window.location.search).get("onboarding") === "1", []);
  const isOnboarding = onboardingRequested || !settings.onboardingCompleted;
  const locale = getLocaleFromSettings(settings);
  const t = getCatalog(locale);
  const selectedGroup = settings.ruleGroups.find((group) => group.id === selectedGroupId) ?? settings.ruleGroups[0];
  const selectedBlockPage = normalizeBlockPageConfig(
    selectedGroup.blockPage,
    getDefaultBlockPageForRuleGroup(selectedGroup, locale),
    { preserveDraftExternalUrl: true }
  );
  const stats = useMemo(() => buildStatsSummary(events, selectedGroup), [events, selectedGroup]);

  useEffect(() => {
    void Promise.all([getAppSettings(), getGuardEvents()]).then(([nextSettings, nextEvents]) => {
      setSettings(nextSettings);
      setSelectedGroupId(nextSettings.ruleGroups[0]?.id ?? DEFAULT_SETTINGS.ruleGroups[0].id);
      setEvents(nextEvents);
    });
  }, []);

  async function persist(next = settings): Promise<void> {
    const normalized = {
      ...next,
      ruleGroups: next.ruleGroups.map((group) => normalizeGroup(group, locale, t)),
      onboardingCompleted: true
    };
    await saveAppSettings(normalized);
    setSettings(normalized);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  function updateGroup(updater: (group: RuleGroup) => RuleGroup): void {
    setSettings({
      ...settings,
      ruleGroups: settings.ruleGroups.map((group) => (group.id === selectedGroup.id ? updater(group) : group))
    });
  }

  function addGroup(): void {
    const id = `rule-${Date.now()}`;
    const defaultGroup = createDefaultRuleGroup(locale);
    const nextGroup: RuleGroup = {
      ...defaultGroup,
      id,
      name: t.defaults.workRuleGroupName,
      schedule: {
        enabled: true,
        startTime: "09:00",
        endTime: "18:00",
        days: [1, 2, 3, 4, 5]
      },
      sites: [],
      commitment: t.defaults.workCommitment,
      blockPage: getDefaultBlockPageForRuleGroup({ id, name: t.defaults.workRuleGroupName }, locale),
      createdAt: new Date().toISOString()
    };
    setSettings({ ...settings, ruleGroups: [...settings.ruleGroups, nextGroup] });
    setSelectedGroupId(id);
  }

  function deleteGroup(id: string): void {
    if (settings.ruleGroups.length <= 1) {
      return;
    }
    const nextGroups = settings.ruleGroups.filter((group) => group.id !== id);
    setSettings({ ...settings, ruleGroups: nextGroups });
    setSelectedGroupId(nextGroups[0].id);
  }

  function addSite(): void {
    const rule = createSiteRule(draftSite);
    if (!rule) {
      return;
    }
    updateGroup((group) => {
      const exists = group.sites.some((site) => site.host === rule.host);
      return exists ? group : { ...group, sites: [...group.sites, rule] };
    });
    setDraftSite("");
  }

  function setMode(mode: BlockMode): void {
    updateGroup((group) => ({
      ...group,
      blockMode: mode,
      maxUnlocksPerSession: mode === "gentle" ? 0 : mode === "strict" ? 1 : 3,
      unlockMinutes: mode === "strict" ? 5 : 10
    }));
  }

  function updateBlockPage(updater: (config: BlockPageConfig) => BlockPageConfig): void {
    updateGroup((group) => ({
      ...group,
      blockPage: updater(normalizeBlockPageConfig(group.blockPage, getDefaultBlockPageForRuleGroup(group, locale), { preserveDraftExternalUrl: true }))
    }));
  }

  function updatePrimaryAction(updater: (config: BlockPageConfig["primaryAction"]) => BlockPageConfig["primaryAction"]): void {
    updateBlockPage((config) => ({
      ...config,
      primaryAction: normalizePrimaryActionConfig(
        updater(config.primaryAction),
        getDefaultBlockPageForRuleGroup(selectedGroup, locale).primaryAction,
        { preserveDraftExternalUrl: true }
      )
    }));
  }

  async function importCustomHtml(file: File | undefined): Promise<void> {
    if (!file) {
      return;
    }
    const html = await file.text();
    updateBlockPage((config) =>
      normalizeBlockPageConfig(
        {
          ...config,
          customHtmlEnabled: true,
          customHtml: html
        },
        getDefaultBlockPageForRuleGroup(selectedGroup, locale)
      )
    );
  }

  async function importHandoffHtml(file: File | undefined): Promise<void> {
    if (!file) {
      return;
    }
    const html = await file.text();
    updatePrimaryAction((action) => ({
      ...action,
      type: "handoff_html",
      handoffHtml: html
    }));
  }

  function toggleDay(day: Weekday): void {
    updateGroup((group) => {
      const exists = group.schedule.days.includes(day);
      const days = exists
        ? group.schedule.days.filter((value) => value !== day)
        : [...group.schedule.days, day].sort((a, b) => a - b);
      return { ...group, schedule: { ...group.schedule, days } };
    });
  }

  function setLanguagePreference(preference: LanguagePreference): void {
    setSettings({
      ...settings,
      language: {
        preference
      }
    });
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
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <BrandMark className="h-12 w-12" />
            <div>
              <p className="text-sm text-slate-500">
                <BrandWordmark compact /> · {t.brand.slogan}
              </p>
              <h1 className="text-2xl font-bold text-slate-950">{isOnboarding ? t.options.onboardingTitle : t.options.title}</h1>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
              href="welcome.html"
            >
              <Home className="h-4 w-4" />
              {t.options.brandHome}
            </a>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              onClick={() => void persist()}
            >
              <Save className="h-4 w-4" />
              {saved ? t.common.saved : isOnboarding ? t.common.completeSetup : t.common.saveSettings}
            </button>
          </div>
        </header>

        {isOnboarding && (
          <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            {t.options.onboardingNotice}
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr_380px]">
          <aside className="space-y-4">
            <Panel icon={<ShieldAlert className="h-5 w-5" />} title={t.options.panels.ruleGroups}>
              <div className="space-y-2">
                {settings.ruleGroups.map((group) => (
                  <button
                    key={group.id}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      group.id === selectedGroup.id
                        ? "border-indigo-300 bg-indigo-50 text-indigo-950"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50"
                    }`}
                    onClick={() => setSelectedGroupId(group.id)}
                  >
                    <span className="block truncate text-sm font-semibold">{group.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {t.options.ruleGroup.statusLine(group.enabled, group.sites.length)}
                    </span>
                  </button>
                ))}
              </div>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
                onClick={addGroup}
              >
                <Plus className="h-4 w-4" />
                {t.options.ruleGroup.new}
              </button>
            </Panel>
          </aside>

          <section className="space-y-6">
            <Panel icon={<Clock className="h-5 w-5" />} title={t.options.panels.basics}>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <Field label={t.options.ruleGroup.name}>
                  <input
                    className="field"
                    value={selectedGroup.name}
                    onChange={(event) => updateGroup((group) => ({ ...group, name: event.target.value }))}
                  />
                </Field>
                <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm sm:mt-7">
                  <span>{t.options.ruleGroup.enabled}</span>
                  <input
                    checked={selectedGroup.enabled}
                    className="h-5 w-5 accent-indigo-500"
                    type="checkbox"
                    onChange={(event) => updateGroup((group) => ({ ...group, enabled: event.target.checked }))}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label={t.options.schedule.startTime}>
                  <input
                    className="field"
                    type="time"
                    value={selectedGroup.schedule.startTime}
                    onChange={(event) =>
                      updateGroup((group) => ({
                        ...group,
                        schedule: { ...group.schedule, startTime: event.target.value }
                      }))
                    }
                  />
                </Field>
                <Field label={t.options.schedule.endTime}>
                  <input
                    className="field"
                    type="time"
                    value={selectedGroup.schedule.endTime}
                    onChange={(event) =>
                      updateGroup((group) => ({
                        ...group,
                        schedule: { ...group.schedule, endTime: event.target.value }
                      }))
                    }
                  />
                </Field>
                <Field label={t.options.schedule.reminder}>
                  <select
                    className="field"
                    value={selectedGroup.reminderMinutes}
                    onChange={(event) => updateGroup((group) => ({ ...group, reminderMinutes: Number(event.target.value) }))}
                  >
                    <option value={0}>{t.options.schedule.noReminder}</option>
                    <option value={15}>{t.options.schedule.reminderOption(15)}</option>
                    <option value={30}>{t.options.schedule.reminderOption(30)}</option>
                    <option value={60}>{t.options.schedule.reminderOption(60)}</option>
                  </select>
                </Field>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">{t.options.schedule.repeatDays}</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.value}
                      className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${
                        selectedGroup.schedule.days.includes(day.value)
                          ? "border-indigo-300 bg-indigo-50 text-indigo-900"
                          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-stone-50"
                      }`}
                      onClick={() => toggleDay(day.value)}
                    >
                      {t.weekdays[day.value]}
                    </button>
                  ))}
                </div>
              </div>
            </Panel>

            <Panel icon={<ShieldAlert className="h-5 w-5" />} title={t.options.panels.sites}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  className="field min-w-0 flex-1"
                  placeholder={t.common.siteExamplePlaceholder}
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
                  {t.options.sites.add}
                </button>
              </div>

              <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
                {selectedGroup.sites.map((site) => (
                  <div key={site.id} className="flex items-center justify-between gap-3 bg-white px-4 py-3">
                    <span className="truncate text-sm text-slate-700">{site.host}</span>
                    <button
                      aria-label={t.options.sites.deleteAria(site.host)}
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                      onClick={() =>
                        updateGroup((group) => ({ ...group, sites: group.sites.filter((item) => item.id !== site.id) }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel icon={<SlidersHorizontal className="h-5 w-5" />} title={t.options.panels.blockMode}>
              <div className="grid gap-3 sm:grid-cols-3">
                {BLOCK_MODE_VALUES.map((mode) => (
                  <button
                    key={mode}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      selectedGroup.blockMode === mode
                        ? "border-indigo-300 bg-indigo-50 text-indigo-950"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50"
                    }`}
                    onClick={() => setMode(mode)}
                  >
                    <span className="block font-semibold">{t.options.blockModes[mode].label}</span>
                    <span className="mt-2 block text-xs leading-5 text-slate-500">{t.options.blockModes[mode].note}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel icon={<Palette className="h-5 w-5" />} title={t.options.panels.blockPage}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.options.blockPage.title}>
                  <input
                    className="field"
                    value={selectedBlockPage.title}
                    onChange={(event) => updateBlockPage((config) => ({ ...config, title: event.target.value }))}
                  />
                </Field>
                <Field label={t.options.blockPage.primaryActionLabel}>
                  <input
                    className="field"
                    value={selectedBlockPage.primaryActionLabel}
                    onChange={(event) =>
                      updateBlockPage((config) => ({ ...config, primaryActionLabel: event.target.value }))
                    }
                  />
                </Field>
              </div>

              <Field label={t.options.blockPage.description}>
                <textarea
                  className="field min-h-24 resize-y"
                  value={selectedBlockPage.description}
                  onChange={(event) => updateBlockPage((config) => ({ ...config, description: event.target.value }))}
                />
              </Field>

              <div className="space-y-4 rounded-lg border border-slate-200 bg-stone-50 p-4">
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700">{t.options.blockPage.primaryAction}</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {PRIMARY_ACTION_VALUES.map((action) => (
                      <button
                        key={action}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          selectedBlockPage.primaryAction.type === action
                            ? "border-indigo-300 bg-indigo-50 text-indigo-950"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50"
                        }`}
                        onClick={() => updatePrimaryAction((config) => ({ ...config, type: action }))}
                      >
                        <span className="block text-sm font-semibold">{t.options.primaryActions[action].label}</span>
                        <span className="mt-2 block text-xs leading-5 text-slate-500">{t.options.primaryActions[action].note}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedBlockPage.primaryAction.type === "external_url" && (
                  <Field label={t.options.blockPage.externalUrl}>
                    <div className="relative">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        className="field pl-10"
                        placeholder={t.common.externalUrlPlaceholder}
                        value={selectedBlockPage.primaryAction.externalUrl}
                        onChange={(event) =>
                          updatePrimaryAction((config) => ({ ...config, externalUrl: event.target.value }))
                        }
                      />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {t.options.blockPage.externalUrlHelp}
                    </p>
                  </Field>
                )}

                {selectedBlockPage.primaryAction.type === "handoff_html" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                      <Field label={t.options.blockPage.handoffTitle}>
                        <input
                          className="field"
                          value={selectedBlockPage.primaryAction.handoffTitle}
                          onChange={(event) =>
                            updatePrimaryAction((config) => ({ ...config, handoffTitle: event.target.value }))
                          }
                        />
                      </Field>
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800 sm:mt-7">
                        <FileUp className="h-4 w-4" />
                        {t.options.blockPage.importHandoff}
                        <input
                          accept=".html,text/html"
                          className="sr-only"
                          type="file"
                          onChange={(event) => {
                            void importHandoffHtml(event.currentTarget.files?.[0]);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <Field label={t.options.blockPage.handoffHtml}>
                      <textarea
                        className="field min-h-44 resize-y font-mono text-xs leading-5"
                        placeholder="<main><h1>{{groupName}}</h1><p>{{commitment}}</p></main>"
                        value={selectedBlockPage.primaryAction.handoffHtml}
                        onChange={(event) =>
                          updatePrimaryAction((config) => ({ ...config, handoffHtml: event.target.value }))
                        }
                      />
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {t.options.blockPage.htmlVariablesWithTime(Math.round(MAX_CUSTOM_HTML_BYTES / 1024))}
                      </p>
                    </Field>
                    <HandoffPreview group={selectedGroup} locale={locale} page={selectedBlockPage} t={t} />
                  </div>
                )}
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">{t.options.blockPage.builtInStyle}</p>
                <div className="grid gap-3 sm:grid-cols-4">
                  {BLOCK_PAGE_TONE_VALUES.map((tone) => (
                    <button
                      key={tone}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        selectedBlockPage.tone === tone
                          ? "border-indigo-300 bg-indigo-50 text-indigo-950"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50"
                      }`}
                      onClick={() => updateBlockPage((config) => ({ ...config, tone }))}
                    >
                      <span className="block text-sm font-semibold">{t.options.blockPageTones[tone].label}</span>
                      <span className="mt-2 block text-xs leading-5 text-slate-500">{t.options.blockPageTones[tone].note}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-medium text-slate-800">{t.options.blockPage.customHtmlEnabled}</span>
                  <span className="text-xs leading-5 text-slate-500">
                    {t.options.blockPage.customHtmlHelp}
                  </span>
                </span>
                <input
                  checked={selectedBlockPage.customHtmlEnabled}
                  className="h-5 w-5 shrink-0 accent-indigo-500"
                  type="checkbox"
                  onChange={(event) =>
                    updateBlockPage((config) => ({ ...config, customHtmlEnabled: event.target.checked }))
                  }
                />
              </label>

              <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                <Field label={t.options.blockPage.singlePageHtml}>
                  <textarea
                    className="field min-h-44 resize-y font-mono text-xs leading-5"
                    placeholder="<main><h1>{{groupName}}</h1><p>{{site}}</p></main>"
                    value={selectedBlockPage.customHtml}
                    onChange={(event) => updateBlockPage((config) => ({ ...config, customHtml: event.target.value }))}
                  />
                </Field>
                <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <Code2 className="h-4 w-4 text-indigo-600" />
                    {t.options.blockPage.htmlConstraints}
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
                    {t.options.blockPage.htmlVariables(Math.round(MAX_CUSTOM_HTML_BYTES / 1024))}
                  </p>
                  <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800">
                    <FileUp className="h-4 w-4" />
                    {t.options.blockPage.importHtml}
                    <input
                      accept=".html,text/html"
                      className="sr-only"
                      type="file"
                      onChange={(event) => {
                        void importCustomHtml(event.currentTarget.files?.[0]);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
                    onClick={() =>
                      updateGroup((group) => ({
                        ...group,
                        blockPage: getDefaultBlockPageForRuleGroup(group, locale)
                      }))
                    }
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t.options.blockPage.restoreDefault}
                  </button>
                </div>
              </div>

              <BlockPagePreview group={selectedGroup} locale={locale} page={selectedBlockPage} t={t} />
            </Panel>
          </section>

          <aside className="space-y-6">
            <Panel icon={<Languages className="h-5 w-5" />} title={t.options.panels.language}>
              <Field label={t.language.label}>
                <select
                  className="field"
                  value={settings.language.preference}
                  onChange={(event) => setLanguagePreference(event.target.value as LanguagePreference)}
                >
                  <option value="auto">{t.language.options.auto}</option>
                  {SUPPORTED_LOCALES.map((item) => (
                    <option key={item} value={item}>
                      {t.language.options[item]}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t.language.helper}</p>
              </Field>
            </Panel>

            <Panel icon={<Unlock className="h-5 w-5" />} title={t.options.panels.unlock}>
              <Field label={t.options.unlock.minutes}>
                <input
                  className="field"
                  min={1}
                  max={60}
                  type="number"
                  value={selectedGroup.unlockMinutes}
                  onChange={(event) => updateGroup((group) => ({ ...group, unlockMinutes: Number(event.target.value) }))}
                />
              </Field>
              <Field label={t.options.unlock.maxPerSession}>
                <input
                  className="field"
                  disabled={selectedGroup.blockMode === "gentle"}
                  min={1}
                  max={10}
                  type="number"
                  value={selectedGroup.blockMode === "gentle" ? 0 : selectedGroup.maxUnlocksPerSession}
                  onChange={(event) => updateGroup((group) => ({ ...group, maxUnlocksPerSession: Number(event.target.value) }))}
                />
              </Field>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
                <span>{t.options.unlock.recordReason}</span>
                <input
                  checked={selectedGroup.recordUnlockReason}
                  className="h-5 w-5 accent-indigo-500"
                  type="checkbox"
                  onChange={(event) => updateGroup((group) => ({ ...group, recordUnlockReason: event.target.checked }))}
                />
              </label>
              <Field label={t.options.unlock.commitment}>
                <textarea
                  className="field min-h-32 resize-y"
                  value={selectedGroup.commitment}
                  onChange={(event) => updateGroup((group) => ({ ...group, commitment: event.target.value }))}
                />
              </Field>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={settings.ruleGroups.length <= 1}
                onClick={() => deleteGroup(selectedGroup.id)}
              >
                <Trash2 className="h-4 w-4" />
                {t.options.ruleGroup.deleteCurrent}
              </button>
            </Panel>

            <Panel icon={<BarChart3 className="h-5 w-5" />} title={t.options.panels.stats}>
              <div className="grid grid-cols-2 gap-3">
                <Metric label={t.options.stats.currentSessionBlocked} value={stats.tonightBlocked} />
                <Metric label={t.options.stats.currentSessionUnlocked} value={stats.tonightUnlocked} />
                <Metric label={t.options.stats.todayBlocked} value={stats.todayBlocked} />
                <Metric label={t.options.stats.todayUnlocked} value={stats.todayUnlocked} />
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">{t.options.stats.topBlocked}</p>
                {stats.topBlockedHosts.length === 0 ? (
                  <p className="text-sm text-slate-500">{t.options.stats.noBlocks}</p>
                ) : (
                  <ul className="space-y-2 text-sm text-slate-600">
                    {stats.topBlockedHosts.map((host) => (
                      <li key={host.host} className="flex justify-between gap-4">
                        <span className="truncate">{host.host}</span>
                        <span>{t.units.count(host.count)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Panel>

            <Panel icon={<Bell className="h-5 w-5" />} title={t.options.panels.privacy}>
              <p className="text-sm leading-6 text-slate-400">
                {t.options.privacy.description}
              </p>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
                onClick={() => void clearData()}
              >
                <Database className="h-4 w-4" />
                {t.options.privacy.clear}
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
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function BlockPagePreview({
  group,
  locale,
  page,
  t
}: {
  group: RuleGroup;
  locale: SupportedLocale;
  page: BlockPageConfig;
  t: LocaleCatalog;
}): JSX.Element {
  const previewSite = group.sites[0]?.host ?? "example.com";
  const previewTime = formatTime(new Date(), locale);

  if (canRenderCustomHtml(page)) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
          <Eye className="h-4 w-4 text-indigo-600" />
          {t.options.blockPage.customPreview}
        </div>
        <iframe
          className="h-56 w-full rounded-lg border border-slate-200 bg-white"
          sandbox=""
          srcDoc={buildSandboxedCustomHtml(page.customHtml, {
            groupName: group.name,
            site: previewSite,
            commitment: group.commitment,
            unlockMinutes: group.unlockMinutes,
            time: previewTime
          })}
          title={t.options.blockPage.customPreviewTitle}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
        <Eye className="h-4 w-4 text-indigo-600" />
        {t.options.blockPage.defaultPreview}
      </div>
      <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-stone-50 p-5 text-center">
        <p className="text-xs font-medium text-indigo-700">{group.name}</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-950">{page.title}</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{page.description}</p>
        <div className="mx-auto mt-4 max-w-md rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
          <p className="text-xs text-slate-500">{t.options.blockPage.commitmentLabel}</p>
          <p className="mt-1 text-sm font-medium text-indigo-900">“{group.commitment}”</p>
        </div>
        <button className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" type="button">
          {page.primaryActionLabel}
        </button>
      </div>
    </div>
  );
}

function HandoffPreview({
  group,
  locale,
  page,
  t
}: {
  group: RuleGroup;
  locale: SupportedLocale;
  page: BlockPageConfig;
  t: LocaleCatalog;
}): JSX.Element {
  const previewSite = group.sites[0]?.host ?? "example.com";
  const previewTime = formatTime(new Date(), locale);
  const action = page.primaryAction;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
        <FileText className="h-4 w-4 text-indigo-600" />
        {t.options.blockPage.handoffPreview}
      </div>
      <div className="mb-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
        <p className="text-xs text-slate-500">{t.options.blockPage.handoffTitlePreview}</p>
        <p className="mt-1 text-sm font-medium text-indigo-900">{action.handoffTitle}</p>
      </div>
      {canRenderHandoffHtml(action) ? (
        <iframe
          className="h-56 w-full rounded-lg border border-slate-200 bg-white"
          sandbox=""
          srcDoc={buildSandboxedCustomHtml(action.handoffHtml, {
            groupName: group.name,
            site: previewSite,
            commitment: group.commitment,
            unlockMinutes: group.unlockMinutes,
            time: previewTime
          })}
          title={t.options.blockPage.handoffPreviewTitle}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-stone-50 p-6 text-center text-sm text-slate-500">
          {t.options.blockPage.handoffEmpty}
        </div>
      )}
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-soft">
      <div className="mb-5 flex items-center gap-2 text-indigo-700">
        {icon}
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function normalizeGroup(group: RuleGroup, locale: SupportedLocale, t: LocaleCatalog): RuleGroup {
  const blockMode = group.blockMode;
  return {
    ...group,
    name: group.name.trim() || t.defaults.unnamedRuleGroup,
    blockPage: normalizeBlockPageConfig(group.blockPage, getDefaultBlockPageForRuleGroup(group, locale)),
    unlockMinutes: clampNumber(group.unlockMinutes, 1, 60),
    reminderMinutes: clampNumber(group.reminderMinutes, 0, 120),
    maxUnlocksPerSession: blockMode === "gentle" ? 0 : clampNumber(group.maxUnlocksPerSession, 1, 10)
  };
}

function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

createRoot(document.getElementById("root")!).render(<OptionsApp />);
