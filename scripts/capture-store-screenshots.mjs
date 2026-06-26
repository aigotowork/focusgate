import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";

const root = resolve(new URL("..", import.meta.url).pathname);
const baseURL = "http://127.0.0.1:51791";
const outputDir = resolve(root, "public/store");
const settingsKey = "goodnightGuard.settings";
const eventsKey = "goodnightGuard.events";

const outputs = [
  "screenshot-01-welcome-1280x800.png",
  "screenshot-02-options-1280x800.png",
  "screenshot-03-popup-1280x800.png",
  "screenshot-04-block-1280x800.png",
  "screenshot-05-handoff-1280x800.png"
];

function nowClock(offsetMinutes) {
  const date = new Date(Date.now() + offsetMinutes * 60000);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function makeSettings() {
  const today = new Date().getDay();
  const everyDay = [0, 1, 2, 3, 4, 5, 6];
  const handoffHtml = `
    <main style="font-family: Inter, PingFang SC, Microsoft YaHei, sans-serif; color: #0f172a; padding: 44px; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); min-height: 100%;">
      <p style="margin: 0 0 12px; color: #4f46e5; font-weight: 700;">晚安守护</p>
      <h2 style="margin: 0; font-size: 34px; line-height: 1.2;">下一步：收束今晚</h2>
      <p style="margin: 18px 0 28px; color: #475569; font-size: 18px;">把页面放下，给明天留一点清醒。</p>
      <section style="display: grid; gap: 14px;">
        <div style="padding: 18px 20px; border: 1px solid #e2e8f0; border-radius: 14px; background: white;">1. 保存手头进度</div>
        <div style="padding: 18px 20px; border: 1px solid #e2e8f0; border-radius: 14px; background: white;">2. 放下屏幕，离开信息流</div>
        <div style="padding: 18px 20px; border: 1px solid #e2e8f0; border-radius: 14px; background: white;">3. 写下明天第一件事</div>
      </section>
    </main>
  `;

  return {
    ruleGroups: [
      {
        id: "goodnight-boundary",
        name: "晚安守护",
        enabled: true,
        schedule: {
          enabled: true,
          startTime: "23:00",
          endTime: "07:00",
          days: everyDay
        },
        sites: [
          { id: "youtube-com", host: "youtube.com", createdAt: "2026-06-26T00:00:00.000Z" },
          { id: "bilibili-com", host: "bilibili.com", createdAt: "2026-06-26T00:00:00.000Z" },
          { id: "reddit-com", host: "reddit.com", createdAt: "2026-06-26T00:00:00.000Z" }
        ],
        commitment: "明天早上的我，会感谢现在放下屏幕的我。",
        blockPage: {
          version: 1,
          title: "现在是晚安时间",
          description: "你已经提前设好边界。今晚先放下这个网站，把明天还给清醒的自己。",
          primaryActionLabel: "打开收束清单",
          primaryAction: {
            type: "handoff_html",
            externalUrl: "",
            handoffTitle: "下一步：收束今晚",
            handoffHtml
          },
          tone: "sleep",
          customHtmlEnabled: false,
          customHtml: ""
        },
        reminderMinutes: 30,
        blockMode: "standard",
        unlockMinutes: 10,
        maxUnlocksPerSession: 3,
        recordUnlockReason: true,
        createdAt: "2026-06-26T00:00:00.000Z"
      },
      {
        id: "work-focus",
        name: "工作时间专注",
        enabled: true,
        schedule: {
          enabled: true,
          startTime: nowClock(-20),
          endTime: nowClock(80),
          days: [today]
        },
        sites: [
          { id: "bilibili-work", host: "bilibili.com", createdAt: "2026-06-26T00:00:00.000Z" },
          { id: "youtube-work", host: "youtube.com", createdAt: "2026-06-26T00:00:00.000Z" },
          { id: "x-work", host: "x.com", createdAt: "2026-06-26T00:00:00.000Z" }
        ],
        commitment: "先完成今天最重要的工作，再看娱乐内容。",
        blockPage: {
          version: 1,
          title: "现在是专注时间",
          description: "视频和信息流先暂停，回到今天最重要的一件事。",
          primaryActionLabel: "关闭页面，回到任务",
          primaryAction: {
            type: "close",
            externalUrl: "",
            handoffTitle: "回到正事",
            handoffHtml: ""
          },
          tone: "focus",
          customHtmlEnabled: false,
          customHtml: ""
        },
        reminderMinutes: 15,
        blockMode: "standard",
        unlockMinutes: 10,
        maxUnlocksPerSession: 3,
        recordUnlockReason: true,
        createdAt: "2026-06-26T00:00:00.000Z"
      },
      {
        id: "weekend-detox",
        name: "周末戒断",
        enabled: true,
        schedule: {
          enabled: true,
          startTime: "10:00",
          endTime: "22:00",
          days: [0, 6]
        },
        sites: [
          { id: "reddit-weekend", host: "reddit.com", createdAt: "2026-06-26T00:00:00.000Z" },
          { id: "hn-weekend", host: "news.ycombinator.com", createdAt: "2026-06-26T00:00:00.000Z" }
        ],
        commitment: "把周末还给现实生活。",
        blockPage: {
          version: 1,
          title: "现在先离开信息流",
          description: "这个周末边界已经开启。给自己留出更慢、更真实的时间。",
          primaryActionLabel: "保持边界",
          primaryAction: {
            type: "close",
            externalUrl: "",
            handoffTitle: "周末下一步",
            handoffHtml: ""
          },
          tone: "calm",
          customHtmlEnabled: false,
          customHtml: ""
        },
        reminderMinutes: 20,
        blockMode: "strict",
        unlockMinutes: 5,
        maxUnlocksPerSession: 1,
        recordUnlockReason: true,
        createdAt: "2026-06-26T00:00:00.000Z"
      }
    ],
    unlocks: [],
    onboardingCompleted: true,
    remindedSessionIds: []
  };
}

function makeEvents() {
  const now = Date.now();
  const event = (type, host, ruleGroupId, ruleGroupName, minutesAgo, idSuffix) => ({
    id: `${type}-${host}-${idSuffix}`,
    type,
    host,
    ruleGroupId,
    ruleGroupName,
    createdAt: new Date(now - minutesAgo * 60000).toISOString()
  });

  return [
    event("blocked", "bilibili.com", "goodnight-boundary", "晚安守护", 18, "01"),
    event("blocked", "youtube.com", "goodnight-boundary", "晚安守护", 42, "02"),
    event("unlocked", "bilibili.com", "goodnight-boundary", "晚安守护", 64, "03"),
    event("blocked", "reddit.com", "weekend-detox", "周末戒断", 118, "04"),
    event("blocked", "bilibili.com", "work-focus", "工作时间专注", 146, "05"),
    event("reminded", "bilibili.com", "work-focus", "工作时间专注", 170, "06")
  ];
}

async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseURL}/popup.html`);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the dev server is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Dev server did not become ready at ${baseURL}`);
}

async function ensureServer() {
  try {
    const response = await fetch(`${baseURL}/popup.html`);
    if (response.ok) {
      return undefined;
    }
  } catch {
    // Start below.
  }

  const child = spawn("npm", ["run", "dev"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, BROWSER: "none" }
  });

  await waitForServer();
  return child;
}

function readPngDimensions(filePath) {
  const buffer = readFileSync(filePath);
  if (buffer.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`${filePath} is not a PNG file.`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function assertScreenshot(filePath) {
  const dimensions = readPngDimensions(filePath);
  if (dimensions.width !== 1280 || dimensions.height !== 800) {
    throw new Error(`${filePath} is ${dimensions.width}x${dimensions.height}, expected 1280x800.`);
  }
}

async function seedPage(page) {
  const settings = makeSettings();
  const events = makeEvents();
  await page.addInitScript(
    ({ settingsKey: injectedSettingsKey, eventsKey: injectedEventsKey, settings: injectedSettings, events: injectedEvents }) => {
      localStorage.setItem(injectedSettingsKey, JSON.stringify(injectedSettings));
      localStorage.setItem(injectedEventsKey, JSON.stringify(injectedEvents));
    },
    { settingsKey, eventsKey, settings, events }
  );
}

async function capturePage(page, url, outputName, options = {}) {
  await page.goto(url, { waitUntil: "networkidle" });
  if (options.waitFor) {
    await page.locator(options.waitFor).first().waitFor({ state: "visible", timeout: 10000 });
  }
  if (options.evaluate) {
    await options.evaluate(page);
  }
  const outputPath = resolve(outputDir, outputName);
  await page.screenshot({ path: outputPath, fullPage: false });
  assertScreenshot(outputPath);
  console.log(`Captured public/store/${outputName}`);
}

async function capturePopupFramed(page) {
  await page.addInitScript((activeUrl) => {
    globalThis.chrome = {
      tabs: {
        query: (_query, callback) => callback([{ url: activeUrl }])
      },
      runtime: {
        getURL: (path) => `/${path}`,
        openOptionsPage: () => undefined
      }
    };
  }, "https://bilibili.com/video");

  await seedPage(page);
  await page.goto(`${baseURL}/popup.html`, { waitUntil: "networkidle" });
  await page.locator("main").waitFor({ state: "visible", timeout: 10000 });
  const outputPath = resolve(outputDir, "screenshot-03-popup-1280x800.png");
  await page.evaluate(() => {
    const popup = document.querySelector("main");
    if (!popup) {
      return;
    }
    document.body.innerHTML = "";
    Object.assign(document.body.style, {
      margin: "0",
      minWidth: "1280px",
      minHeight: "800px",
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(180deg, #f7f7fb 0%, #eef2ff 100%)",
      fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif"
    });

    const shell = document.createElement("section");
    Object.assign(shell.style, {
      width: "100%",
      height: "100%",
      display: "grid",
      gridTemplateColumns: "1fr 420px",
      alignItems: "center",
      gap: "74px",
      padding: "72px 110px",
      boxSizing: "border-box"
    });

    const copy = document.createElement("div");
    copy.innerHTML = `
      <p style="margin: 0 0 18px; color: #475569; font-size: 24px; font-weight: 700;">FocusGate / 守界</p>
      <h1 style="margin: 0; color: #020617; font-size: 58px; line-height: 1.12; letter-spacing: 0; font-weight: 850;">打开弹窗，<br><span style="color: #4f46e5;">立刻看见当前边界。</span></h1>
      <p style="margin: 28px 0 0; color: #475569; font-size: 22px; line-height: 1.7; max-width: 610px;">当前网站是否受限、命中哪个规则组、今天阻断和解锁了几次，都在一个低打扰面板里。</p>
    `;

    const frame = document.createElement("div");
    Object.assign(frame.style, {
      width: "360px",
      padding: "18px",
      borderRadius: "28px",
      background: "rgba(255,255,255,0.72)",
      border: "1px solid #dbe3ef",
      boxShadow: "0 30px 70px rgba(51,65,85,0.18)"
    });
    Object.assign(popup.style, {
      width: "320px",
      minHeight: "auto",
      borderRadius: "18px",
      overflow: "hidden"
    });
    frame.appendChild(popup);
    shell.append(copy, frame);
    document.body.appendChild(shell);
  });
  await page.screenshot({ path: outputPath, fullPage: false });
  assertScreenshot(outputPath);
  console.log("Captured public/store/screenshot-03-popup-1280x800.png");
}

async function main() {
  mkdirSync(outputDir, { recursive: true });
  const server = await ensureServer();
  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
      locale: "zh-CN",
      timezoneId: "Asia/Shanghai"
    });

    const page = await context.newPage();
    await capturePage(page, `${baseURL}/welcome.html`, "screenshot-01-welcome-1280x800.png", {
      waitFor: "text=该专注时"
    });

    const optionsPage = await context.newPage();
    await seedPage(optionsPage);
    await capturePage(optionsPage, `${baseURL}/options.html?onboarding=1`, "screenshot-02-options-1280x800.png", {
      waitFor: "text=规则组基础"
    });

    const popupPage = await context.newPage();
    await capturePopupFramed(popupPage);

    const blockPage = await context.newPage();
    await seedPage(blockPage);
    await capturePage(blockPage, `${baseURL}/block.html?site=bilibili.com&group=goodnight-boundary`, "screenshot-04-block-1280x800.png", {
      waitFor: "text=已拦截访问：bilibili.com",
      evaluate: async (currentPage) => {
        await currentPage.evaluate(() => {
          const main = document.querySelector("main");
          if (!main) {
            return;
          }
          Object.assign(document.body.style, {
            overflow: "hidden",
            background: "#f7f7fb"
          });
          Object.assign(main.style, {
            minHeight: "953px",
            width: "119.05%",
            marginLeft: "-9.525%",
            paddingTop: "28px",
            paddingBottom: "28px",
            transform: "scale(0.84)",
            transformOrigin: "top center"
          });
        });
      }
    });

    const handoffPage = await context.newPage();
    await seedPage(handoffPage);
    await capturePage(handoffPage, `${baseURL}/handoff.html?site=bilibili.com&group=goodnight-boundary`, "screenshot-05-handoff-1280x800.png", {
      waitFor: "iframe"
    });

    for (const output of outputs) {
      const outputPath = resolve(outputDir, output);
      if (!existsSync(outputPath)) {
        throw new Error(`Missing expected screenshot ${outputPath}`);
      }
    }
  } finally {
    await browser.close();
    if (server) {
      server.kill("SIGTERM");
    }
  }

  const status = spawnSync("git", ["status", "--short", "public/store"], { cwd: root, encoding: "utf8" });
  if (status.status === 0) {
    console.log(status.stdout.trim());
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
