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
import { BRAND } from "../shared/brand";
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
import { DEFAULT_RULE_GROUP, DEFAULT_SETTINGS } from "../shared/defaults";
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
  { value: "standard", label: "标准", note: "每个周期 3 次解锁，适合默认使用。" },
  { value: "strict", label: "严格", note: "每个周期 1 次解锁，冷静期更有重量。" }
];

const BLOCK_PAGE_TONES: Array<{ value: BlockPageTone; label: string; note: string }> = [
  { value: "sleep", label: "晚安", note: "低光、安静，适合睡前边界。" },
  { value: "focus", label: "专注", note: "清晰、利落，适合工作学习。" },
  { value: "calm", label: "平静", note: "柔和中性，适合日常节制。" },
  { value: "strict", label: "坚定", note: "更强提醒，适合高风险站点。" }
];

const PRIMARY_ACTIONS: Array<{ value: BlockPagePrimaryActionType; label: string; note: string }> = [
  { value: "close", label: "关闭页面", note: "保持当前行为，点击后尝试关闭阻断页。" },
  { value: "external_url", label: "跳转链接", note: "去到工作台、任务系统或其他网页。" },
  { value: "handoff_html", label: "打开承接页", note: "在扩展内显示静态 HTML 内容。" }
];

function OptionsApp(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [events, setEvents] = useState<GuardEvent[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(DEFAULT_SETTINGS.ruleGroups[0].id);
  const [draftSite, setDraftSite] = useState("");
  const [saved, setSaved] = useState(false);
  const onboardingRequested = useMemo(() => new URLSearchParams(window.location.search).get("onboarding") === "1", []);
  const isOnboarding = onboardingRequested || !settings.onboardingCompleted;
  const selectedGroup = settings.ruleGroups.find((group) => group.id === selectedGroupId) ?? settings.ruleGroups[0];
  const selectedBlockPage = normalizeBlockPageConfig(
    selectedGroup.blockPage,
    getDefaultBlockPageForRuleGroup(selectedGroup),
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
      ruleGroups: next.ruleGroups.map(normalizeGroup),
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
    const nextGroup: RuleGroup = {
      ...DEFAULT_RULE_GROUP,
      id,
      name: "工作时间专注",
      schedule: {
        enabled: true,
        startTime: "09:00",
        endTime: "18:00",
        days: [1, 2, 3, 4, 5]
      },
      sites: [],
      commitment: "先把重要的事做完，再看娱乐内容。",
      blockPage: getDefaultBlockPageForRuleGroup({ id, name: "工作时间专注" }),
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
      blockPage: updater(normalizeBlockPageConfig(group.blockPage, getDefaultBlockPageForRuleGroup(group), { preserveDraftExternalUrl: true }))
    }));
  }

  function updatePrimaryAction(updater: (config: BlockPageConfig["primaryAction"]) => BlockPageConfig["primaryAction"]): void {
    updateBlockPage((config) => ({
      ...config,
      primaryAction: normalizePrimaryActionConfig(
        updater(config.primaryAction),
        getDefaultBlockPageForRuleGroup(selectedGroup).primaryAction,
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
        getDefaultBlockPageForRuleGroup(selectedGroup)
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
                <BrandWordmark compact /> · {BRAND.slogan}
              </p>
              <h1 className="text-2xl font-bold text-slate-950">{isOnboarding ? "完成规则组初始设置" : "规则组设置"}</h1>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
              href="welcome.html"
            >
              <Home className="h-4 w-4" />
              品牌主页
            </a>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              onClick={() => void persist()}
            >
              <Save className="h-4 w-4" />
              {saved ? "已保存" : isOnboarding ? "完成设置" : "保存设置"}
            </button>
          </div>
        </header>

        {isOnboarding && (
          <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            先保留默认的“晚安边界”，也可以新增“工作时间专注”等规则组。每个规则组都有自己的时间、站点、承诺语、提醒、阻断页和解锁限制。
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr_380px]">
          <aside className="space-y-4">
            <Panel icon={<ShieldAlert className="h-5 w-5" />} title="规则组">
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
                      {group.enabled ? "启用" : "停用"} · {group.sites.length} 个站点
                    </span>
                  </button>
                ))}
              </div>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800"
                onClick={addGroup}
              >
                <Plus className="h-4 w-4" />
                新建规则组
              </button>
            </Panel>
          </aside>

          <section className="space-y-6">
            <Panel icon={<Clock className="h-5 w-5" />} title="规则组基础">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <Field label="规则组名称">
                  <input
                    className="field"
                    value={selectedGroup.name}
                    onChange={(event) => updateGroup((group) => ({ ...group, name: event.target.value }))}
                  />
                </Field>
                <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm sm:mt-7">
                  <span>启用</span>
                  <input
                    checked={selectedGroup.enabled}
                    className="h-5 w-5 accent-indigo-500"
                    type="checkbox"
                    onChange={(event) => updateGroup((group) => ({ ...group, enabled: event.target.checked }))}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="开始时间">
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
                <Field label="结束时间">
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
                <Field label="提前提醒">
                  <select
                    className="field"
                    value={selectedGroup.reminderMinutes}
                    onChange={(event) => updateGroup((group) => ({ ...group, reminderMinutes: Number(event.target.value) }))}
                  >
                    <option value={0}>不提醒</option>
                    <option value={15}>提前 15 分钟</option>
                    <option value={30}>提前 30 分钟</option>
                    <option value={60}>提前 60 分钟</option>
                  </select>
                </Field>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">重复日期</p>
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
                  placeholder="例如 bilibili.com"
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

              <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
                {selectedGroup.sites.map((site) => (
                  <div key={site.id} className="flex items-center justify-between gap-3 bg-white px-4 py-3">
                    <span className="truncate text-sm text-slate-700">{site.host}</span>
                    <button
                      aria-label={`删除 ${site.host}`}
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

            <Panel icon={<SlidersHorizontal className="h-5 w-5" />} title="阻断强度">
              <div className="grid gap-3 sm:grid-cols-3">
                {BLOCK_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      selectedGroup.blockMode === mode.value
                        ? "border-indigo-300 bg-indigo-50 text-indigo-950"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50"
                    }`}
                    onClick={() => setMode(mode.value)}
                  >
                    <span className="block font-semibold">{mode.label}</span>
                    <span className="mt-2 block text-xs leading-5 text-slate-500">{mode.note}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel icon={<Palette className="h-5 w-5" />} title="阻断页展示">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="页面标题">
                  <input
                    className="field"
                    value={selectedBlockPage.title}
                    onChange={(event) => updateBlockPage((config) => ({ ...config, title: event.target.value }))}
                  />
                </Field>
                <Field label="主按钮文案">
                  <input
                    className="field"
                    value={selectedBlockPage.primaryActionLabel}
                    onChange={(event) =>
                      updateBlockPage((config) => ({ ...config, primaryActionLabel: event.target.value }))
                    }
                  />
                </Field>
              </div>

              <Field label="说明文案">
                <textarea
                  className="field min-h-24 resize-y"
                  value={selectedBlockPage.description}
                  onChange={(event) => updateBlockPage((config) => ({ ...config, description: event.target.value }))}
                />
              </Field>

              <div className="space-y-4 rounded-lg border border-slate-200 bg-stone-50 p-4">
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700">主按钮行为</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {PRIMARY_ACTIONS.map((action) => (
                      <button
                        key={action.value}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          selectedBlockPage.primaryAction.type === action.value
                            ? "border-indigo-300 bg-indigo-50 text-indigo-950"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50"
                        }`}
                        onClick={() => updatePrimaryAction((config) => ({ ...config, type: action.value }))}
                      >
                        <span className="block text-sm font-semibold">{action.label}</span>
                        <span className="mt-2 block text-xs leading-5 text-slate-500">{action.note}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedBlockPage.primaryAction.type === "external_url" && (
                  <Field label="跳转链接">
                    <div className="relative">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        className="field pl-10"
                        placeholder="https://example.com/todo"
                        value={selectedBlockPage.primaryAction.externalUrl}
                        onChange={(event) =>
                          updatePrimaryAction((config) => ({ ...config, externalUrl: event.target.value }))
                        }
                      />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      只支持以 http:// 或 https:// 开头的外部链接。临时解锁仍会返回原网站，不受这里影响。
                    </p>
                  </Field>
                )}

                {selectedBlockPage.primaryAction.type === "handoff_html" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                      <Field label="承接页标题">
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
                        导入承接页
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
                    <Field label="承接页 HTML">
                      <textarea
                        className="field min-h-44 resize-y font-mono text-xs leading-5"
                        placeholder="<main><h1>下一步</h1><p>{{commitment}}</p></main>"
                        value={selectedBlockPage.primaryAction.handoffHtml}
                        onChange={(event) =>
                          updatePrimaryAction((config) => ({ ...config, handoffHtml: event.target.value }))
                        }
                      />
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        最大 {Math.round(MAX_CUSTOM_HTML_BYTES / 1024)}KB。可使用变量：{"{{groupName}}"}、{"{{site}}"}、
                        {"{{commitment}}"}、{"{{unlockMinutes}}"}、{"{{time}}"}。
                      </p>
                    </Field>
                    <HandoffPreview group={selectedGroup} page={selectedBlockPage} />
                  </div>
                )}
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">内置风格</p>
                <div className="grid gap-3 sm:grid-cols-4">
                  {BLOCK_PAGE_TONES.map((tone) => (
                    <button
                      key={tone.value}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        selectedBlockPage.tone === tone.value
                          ? "border-indigo-300 bg-indigo-50 text-indigo-950"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50"
                      }`}
                      onClick={() => updateBlockPage((config) => ({ ...config, tone: tone.value }))}
                    >
                      <span className="block text-sm font-semibold">{tone.label}</span>
                      <span className="mt-2 block text-xs leading-5 text-slate-500">{tone.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-medium text-slate-800">使用自定义 HTML</span>
                  <span className="text-xs leading-5 text-slate-500">
                    仅渲染静态 HTML/CSS，脚本、表单和顶层跳转不会获得权限。
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
                <Field label="单页 HTML">
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
                    HTML 约束
                  </div>
                  <p className="text-xs leading-5 text-slate-500">
                    最大 {Math.round(MAX_CUSTOM_HTML_BYTES / 1024)}KB。可使用变量：{"{{groupName}}"}、{"{{site}}"}、{"{{commitment}}"}、{"{{unlockMinutes}}"}。
                  </p>
                  <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800">
                    <FileUp className="h-4 w-4" />
                    导入 .html
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
                        blockPage: getDefaultBlockPageForRuleGroup(group)
                      }))
                    }
                  >
                    <RotateCcw className="h-4 w-4" />
                    恢复默认
                  </button>
                </div>
              </div>

              <BlockPagePreview group={selectedGroup} page={selectedBlockPage} />
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
                  value={selectedGroup.unlockMinutes}
                  onChange={(event) => updateGroup((group) => ({ ...group, unlockMinutes: Number(event.target.value) }))}
                />
              </Field>
              <Field label="每个周期最大解锁次数">
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
                <span>记录解锁原因</span>
                <input
                  checked={selectedGroup.recordUnlockReason}
                  className="h-5 w-5 accent-indigo-500"
                  type="checkbox"
                  onChange={(event) => updateGroup((group) => ({ ...group, recordUnlockReason: event.target.checked }))}
                />
              </label>
              <Field label="承诺语">
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
                删除当前规则组
              </button>
            </Panel>

            <Panel icon={<BarChart3 className="h-5 w-5" />} title="当前组统计">
              <div className="grid grid-cols-2 gap-3">
                <Metric label="本周期阻断" value={stats.tonightBlocked} />
                <Metric label="本周期解锁" value={stats.tonightUnlocked} />
                <Metric label="今日阻断" value={stats.todayBlocked} />
                <Metric label="今日解锁" value={stats.todayUnlocked} />
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="mb-3 text-sm font-medium text-slate-700">最常被阻断</p>
                {stats.topBlockedHosts.length === 0 ? (
                  <p className="text-sm text-slate-500">还没有阻断记录。</p>
                ) : (
                  <ul className="space-y-2 text-sm text-slate-600">
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

            <Panel icon={<Bell className="h-5 w-5" />} title="隐私与数据">
              <p className="text-sm leading-6 text-slate-400">
                插件只在本地保存设置、域名级事件、规则组归属和解锁原因，不记录页面标题、完整浏览历史或网页内容。
              </p>
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
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
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function BlockPagePreview({ group, page }: { group: RuleGroup; page: BlockPageConfig }): JSX.Element {
  const previewSite = group.sites[0]?.host ?? "example.com";
  const previewTime = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

  if (canRenderCustomHtml(page)) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
          <Eye className="h-4 w-4 text-indigo-600" />
          自定义 HTML 预览
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
          title="阻断页自定义 HTML 预览"
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
        <Eye className="h-4 w-4 text-indigo-600" />
        默认页面预览
      </div>
      <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-stone-50 p-5 text-center">
        <p className="text-xs font-medium text-indigo-700">{group.name}</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-950">{page.title}</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{page.description}</p>
        <div className="mx-auto mt-4 max-w-md rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
          <p className="text-xs text-slate-500">承诺语</p>
          <p className="mt-1 text-sm font-medium text-indigo-900">“{group.commitment}”</p>
        </div>
        <button className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" type="button">
          {page.primaryActionLabel}
        </button>
      </div>
    </div>
  );
}

function HandoffPreview({ group, page }: { group: RuleGroup; page: BlockPageConfig }): JSX.Element {
  const previewSite = group.sites[0]?.host ?? "example.com";
  const previewTime = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  const action = page.primaryAction;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
        <FileText className="h-4 w-4 text-indigo-600" />
        承接页预览
      </div>
      <div className="mb-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
        <p className="text-xs text-slate-500">页面标题</p>
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
          title="承接页 HTML 预览"
        />
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-stone-50 p-6 text-center text-sm text-slate-500">
          填入 HTML 后会在这里预览。
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

function normalizeGroup(group: RuleGroup): RuleGroup {
  const blockMode = group.blockMode;
  return {
    ...group,
    name: group.name.trim() || "未命名规则组",
    blockPage: normalizeBlockPageConfig(group.blockPage, getDefaultBlockPageForRuleGroup(group)),
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
