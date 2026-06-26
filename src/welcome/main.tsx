import React from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, Bell, BriefcaseBusiness, Moon, ShieldCheck, Target } from "lucide-react";
import "../styles/global.css";
import { BRAND } from "../shared/brand";
import { BrandMark, BrandWordmark } from "../shared/brand-ui";
import { getExtensionUrl } from "../shared/browser";

const scenarios = [
  {
    icon: Moon,
    title: "睡前放下",
    copy: "保留默认的“晚安边界”，让娱乐网站在休息时间主动退场。"
  },
  {
    icon: BriefcaseBusiness,
    title: "工作专注",
    copy: "为工作日设置规则组，让视频、社区和信息流在关键时段变得更难打开。"
  },
  {
    icon: Target,
    title: "戒断节制",
    copy: "对高刺激站点增加提醒、阻断和解锁摩擦，把选择权留给清醒的自己。"
  }
];

const workflow = [
  "创建一个规则组",
  "选择限制站点和时间",
  "设置承诺语、提醒和阻断页",
  "到点由守界执行边界"
];

function WelcomeApp(): JSX.Element {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7fb] text-slate-800">
      <section className="relative min-h-screen px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_35%,rgba(99,102,241,0.10),transparent_70%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(99,102,241,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />

        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <a className="inline-flex items-center gap-3 rounded-xl px-1 py-1 text-slate-950" href={getExtensionUrl("welcome.html")}>
            <BrandMark className="h-11 w-11" />
            <BrandWordmark />
          </a>
          <a
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
            href={getExtensionUrl("options.html")}
          >
            打开设置
          </a>
        </header>

        <div className="mx-auto grid max-w-6xl items-center gap-10 pb-8 pt-14 lg:grid-cols-[1.04fr_0.96fr] lg:pt-20">
          <section className="max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              浏览器里的注意力边界
            </div>
            <h1 className="text-5xl font-extrabold tracking-normal text-slate-950 sm:text-6xl">
              <span className="block">该专注时，</span>
              <span className="mt-2 block text-indigo-600">守住你的注意力边界。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {BRAND.nameZh} 用规则组为睡眠、工作和戒断场景建立可执行的网站边界。你提前设定规则，
              插件在关键时段提醒、阻断、承接下一步，并记录边界执行情况。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-soft transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                href={getExtensionUrl("options.html?onboarding=1")}
              >
                开始设置边界
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-6 py-4 text-base font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"
                href={getExtensionUrl("popup.html")}
              >
                查看插件弹窗
              </a>
            </div>
          </section>

          <section aria-label="守界工作方式" className="rounded-2xl border border-slate-200 bg-white/92 p-5 shadow-soft">
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-500">FocusGate</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">规则组正在守住边界</h2>
                </div>
                <BrandMark className="h-16 w-16" />
              </div>
              <div className="mt-6 grid gap-3">
                {workflow.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border border-white bg-white/82 px-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {scenarios.map((scenario) => (
                <article key={scenario.title} className="rounded-xl border border-slate-200 bg-white p-4">
                  <scenario.icon className="h-5 w-5 text-indigo-600" />
                  <h3 className="mt-3 font-semibold text-slate-950">{scenario.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{scenario.copy}</p>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <p className="text-sm leading-6 text-amber-900">
                  提前提醒、阻断页、临时解锁和承接页都按规则组配置。睡眠、工作和戒断可以拥有不同文案与不同强度。
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<WelcomeApp />);
