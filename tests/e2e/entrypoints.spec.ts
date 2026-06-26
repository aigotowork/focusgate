import { expect, test } from "@playwright/test";

const SETTINGS_KEY = "goodnightGuard.settings";

test("popup entry renders the extension summary", async ({ page }) => {
  await page.goto("/popup.html");
  await expect(page.locator("header").getByText("FocusGate", { exact: true })).toBeVisible();
  await expect(page.getByText("当前页面").first()).toBeVisible();
  await expect(page.getByText("今日阻断")).toBeVisible();
  await expect(page.getByText("今日解锁")).toBeVisible();
  await expect(page.getByRole("button", { name: "加入到 晚安守护" })).toBeVisible();
});

test("welcome entry explains the FocusGate brand and links to setup", async ({ page }) => {
  await page.goto("/welcome.html");
  await expect(page.getByText("FocusGate").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /该专注时/ })).toBeVisible();
  await expect(page.getByText("守住你的注意力边界").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /开始设置边界/ })).toHaveAttribute("href", "/options.html?onboarding=1");
  await expect(page.getByText("睡前放下")).toBeVisible();
  await expect(page.getByText("工作专注")).toBeVisible();
  await expect(page.getByText("戒断节制")).toBeVisible();
});

test("popup prioritizes the current page matching a non-sleep rule group", async ({ page }) => {
  await mockActiveTabUrl(page, "https://127.0.0.1/video");
  const ruleGroup = await buildActiveRuleGroup(page);
  await seedSettings(page, [ruleGroup]);

  await page.goto("/popup.html");
  await expect(page.locator("header").getByText("FocusGate", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "当前页面会被阻断" })).toBeVisible();
  await expect(page.getByText("工作时间专注").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "已在该规则组" })).toBeVisible();
});

test("options entry renders editable settings", async ({ page }) => {
  await page.goto("/options.html");
  await expect(page.getByRole("heading", { name: "完成规则组初始设置" })).toBeVisible();
  await expect(page.getByText("规则组", { exact: true })).toBeVisible();
  await expect(page.getByText("规则组基础")).toBeVisible();
  await expect(page.getByText("网站规则")).toBeVisible();
  await expect(page.getByText("阻断强度")).toBeVisible();
  await expect(page.getByText("阻断页展示")).toBeVisible();
  await expect(page.getByText("当前组统计")).toBeVisible();
  await page.getByRole("button", { name: "新建规则组" }).click();
  await expect(page.locator('input[value="工作时间专注"]')).toBeVisible();
  await expect(page.locator('input[value="现在是限制时间"]')).toBeVisible();
});

test("options saves per-group block page copy", async ({ page }) => {
  await page.goto("/options.html");
  await page.getByRole("button", { name: "新建规则组" }).click();
  await page.locator('input[value="现在是限制时间"]').fill("现在是专注时间");
  await page.getByRole("button", { name: /完成设置|保存设置/ }).click();
  await expect(page.getByRole("button", { name: "已保存" })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /工作时间专注/ }).click();
  await expect(page.locator('input[value="现在是专注时间"]')).toBeVisible();
});

test("options saves per-group primary action settings", async ({ page }) => {
  await page.goto("/options.html");
  await page.getByRole("button", { name: "新建规则组" }).click();
  await page.getByRole("button", { name: /跳转链接/ }).click();
  await page.getByPlaceholder("https://example.com/todo").fill("https://127.0.0.1:51791/options.html?todo=1");
  await page.getByRole("button", { name: /完成设置|保存设置/ }).click();
  await expect(page.getByRole("button", { name: "已保存" })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /工作时间专注/ }).click();
  await expect(page.getByPlaceholder("https://example.com/todo")).toHaveValue("https://127.0.0.1:51791/options.html?todo=1");
});

test("block entry renders the bedtime boundary", async ({ page }) => {
  await page.goto("/block.html?site=youtube.com&group=goodnight-boundary");
  await expect(page.getByText("晚安守护").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "现在是晚安时间" })).toBeVisible();
  await expect(page.getByText("已拦截访问：youtube.com")).toBeVisible();
  await expect(page.getByRole("button", { name: "关掉网页，我去睡了" })).toBeVisible();
  await page.getByRole("button", { name: /临时解锁/ }).click();
  await expect(page.getByText("请深呼吸，冷静一下...")).toBeVisible();
});

test("block entry renders a custom group block page", async ({ page }) => {
  await seedSettings(page, [
    {
      id: "work-focus",
      name: "工作时间专注",
      enabled: true,
      schedule: { enabled: true, startTime: "09:00", endTime: "18:00", days: [1, 2, 3, 4, 5] },
      sites: [{ id: "bilibili", host: "bilibili.com", createdAt: "" }],
      commitment: "先完成今天最重要的工作。",
      blockPage: {
        version: 1,
        title: "现在是专注时间",
        description: "视频站点先暂停，回到今天的主线。",
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
      createdAt: ""
    }
  ]);

  await page.goto("/block.html?site=bilibili.com&group=work-focus");
  await expect(page.getByText("工作时间专注").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "现在是专注时间" })).toBeVisible();
  await expect(page.getByText("视频站点先暂停，回到今天的主线。")).toBeVisible();
  await expect(page.getByRole("button", { name: "关闭页面，回到任务" })).toBeVisible();
  await expect(page.getByText("现在是晚安时间")).toHaveCount(0);
});

test("block entry renders custom HTML inside a sandboxed iframe", async ({ page }) => {
  await seedSettings(page, [
    {
      id: "work-focus",
      name: "工作时间专注",
      enabled: true,
      schedule: { enabled: true, startTime: "09:00", endTime: "18:00", days: [1, 2, 3, 4, 5] },
      sites: [{ id: "bilibili", host: "bilibili.com", createdAt: "" }],
      commitment: "先完成今天最重要的工作。",
      blockPage: {
        version: 1,
        title: "现在是专注时间",
        description: "视频站点先暂停，回到今天的主线。",
        primaryActionLabel: "关闭页面，回到任务",
        primaryAction: {
          type: "close",
          externalUrl: "",
          handoffTitle: "回到正事",
          handoffHtml: ""
        },
        tone: "focus",
        customHtmlEnabled: true,
        customHtml: "<main><h2>自定义边界：{{groupName}}</h2><p>{{site}}</p><script>window.parent.document.body.dataset.pwned = '1'</script></main>"
      },
      reminderMinutes: 15,
      blockMode: "standard",
      unlockMinutes: 10,
      maxUnlocksPerSession: 3,
      recordUnlockReason: true,
      createdAt: ""
    }
  ]);

  await page.goto("/block.html?site=bilibili.com&group=work-focus");
  const frameElement = page.locator("iframe").first();
  await expect(frameElement).toBeVisible();
  await expect(frameElement).toHaveAttribute("sandbox", "");
  await expect(page.frameLocator("iframe").getByText("自定义边界：工作时间专注")).toBeVisible();
  await expect(page.getByRole("button", { name: "关闭页面，回到任务" })).toBeVisible();
  await expect(page.locator("body")).not.toHaveAttribute("data-pwned", "1");
});

test("block primary action can navigate to an external URL", async ({ page }) => {
  await seedSettings(page, [
    {
      id: "work-focus",
      name: "工作时间专注",
      enabled: true,
      schedule: { enabled: true, startTime: "09:00", endTime: "18:00", days: [1, 2, 3, 4, 5] },
      sites: [{ id: "bilibili", host: "bilibili.com", createdAt: "" }],
      commitment: "先完成今天最重要的工作。",
      blockPage: {
        version: 1,
        title: "现在是专注时间",
        description: "视频站点先暂停，回到今天的主线。",
        primaryActionLabel: "打开工作清单",
        primaryAction: {
          type: "external_url",
          externalUrl: "http://127.0.0.1:51791/options.html?todo=1",
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
      createdAt: ""
    }
  ]);

  await page.goto("/block.html?site=bilibili.com&group=work-focus");
  await page.getByRole("button", { name: "打开工作清单" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:51791/options.html?todo=1");
});

test("block primary action can open a sandboxed handoff page", async ({ page }) => {
  await seedSettings(page, [
    {
      id: "work-focus",
      name: "工作时间专注",
      enabled: true,
      schedule: { enabled: true, startTime: "09:00", endTime: "18:00", days: [1, 2, 3, 4, 5] },
      sites: [{ id: "bilibili", host: "bilibili.com", createdAt: "" }],
      commitment: "先完成今天最重要的工作。",
      blockPage: {
        version: 1,
        title: "现在是专注时间",
        description: "视频站点先暂停，回到今天的主线。",
        primaryActionLabel: "打开下一步",
        primaryAction: {
          type: "handoff_html",
          externalUrl: "",
          handoffTitle: "工作清单",
          handoffHtml:
            "<main><h2>下一步：{{groupName}}</h2><p>{{site}}</p><script>window.parent.document.body.dataset.pwned = '1'</script></main>"
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
      createdAt: ""
    }
  ]);

  await page.goto("/block.html?site=bilibili.com&group=work-focus");
  await page.getByRole("button", { name: "打开下一步" }).click();
  await expect(page).toHaveURL(/handoff\.html\?site=bilibili\.com&group=work-focus/);
  await expect(page.getByRole("heading", { name: "工作清单" })).toBeVisible();
  const frameElement = page.locator("iframe").first();
  await expect(frameElement).toBeVisible();
  await expect(frameElement).toHaveAttribute("sandbox", "");
  await expect(page.frameLocator("iframe").getByText("下一步：工作时间专注")).toBeVisible();
  await expect(page.locator("body")).not.toHaveAttribute("data-pwned", "1");
});

test("content reminder overlay appears on listed sites during the reminder window", async ({ page }) => {
  await page.goto("/popup.html");
  const ruleGroup = await buildReminderRuleGroup(page);
  await page.evaluate(
    ({ key, group }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          ruleGroups: [group],
          unlocks: [],
          onboardingCompleted: true,
          remindedSessionIds: []
        })
      );
    },
    { key: SETTINGS_KEY, group: ruleGroup }
  );

  await injectReminderOverlay(page);
  const overlay = page.locator("#goodnight-guard-reminder-root");
  await expect(overlay).toBeAttached();
  await expect(page.locator("#goodnight-guard-reminder-root").evaluate((node) => node.shadowRoot?.textContent ?? "")).resolves.toContain(
    "守界"
  );
  await expect(page.locator("#goodnight-guard-reminder-root").evaluate((node) => node.shadowRoot?.textContent ?? "")).resolves.toContain(
    "测试提醒即将开启"
  );
  await expect(page.locator("#goodnight-guard-reminder-root").evaluate((node) => node.shadowRoot?.textContent ?? "")).resolves.toContain(
    "后进入限制时间"
  );
  await expect(page.locator("#goodnight-guard-reminder-root").evaluate((node) => node.shadowRoot?.textContent ?? "")).resolves.not.toContain(
    "晚安守护"
  );
  const progressValue = await page.locator("#goodnight-guard-reminder-root").evaluate((node) => {
    return node.shadowRoot?.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow") ?? "";
  });
  expect(Number(progressValue)).toBeGreaterThanOrEqual(0);
  expect(Number(progressValue)).toBeLessThanOrEqual(100);
  const progressStyle = await page.locator("#goodnight-guard-reminder-root").evaluate((node) => {
    const bar = node.shadowRoot?.querySelector<HTMLElement>(".progressBar");
    return {
      transform: bar?.style.transform ?? "",
      animationDuration: bar?.style.animationDuration ?? ""
    };
  });
  expect(progressStyle.transform).toMatch(/^scaleX\(/);
  expect(progressStyle.animationDuration).toMatch(/s$/);
});

test("content reminder overlay stays hidden on unlisted sites and can be dismissed", async ({ page }) => {
  await page.goto("/popup.html");
  const ruleGroup = await buildReminderRuleGroup(page, "example.com");
  await page.evaluate(
    ({ key, group }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          ruleGroups: [group],
          unlocks: [],
          onboardingCompleted: true,
          remindedSessionIds: []
        })
      );
    },
    { key: SETTINGS_KEY, group: ruleGroup }
  );

  await injectReminderOverlay(page);
  await expect(page.locator("#goodnight-guard-reminder-root")).toHaveCount(0);

  const matchingGroup = await buildReminderRuleGroup(page);
  await page.evaluate(
    ({ key, group }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          ruleGroups: [group],
          unlocks: [],
          onboardingCompleted: true,
          remindedSessionIds: []
        })
      );
    },
    { key: SETTINGS_KEY, group: matchingGroup }
  );
  await page.reload();
  await injectReminderOverlay(page);

  await expect(page.locator("#goodnight-guard-reminder-root")).toBeAttached();
  await page.locator("#goodnight-guard-reminder-root").evaluate((node) => {
    const button = Array.from(node.shadowRoot?.querySelectorAll("button") ?? []).find(
      (item) => item.textContent === "我知道了"
    );
    (button as HTMLButtonElement | undefined)?.click();
  });
  await expect(page.locator("#goodnight-guard-reminder-root")).toHaveCount(0);
});

async function seedSettings(page: import("@playwright/test").Page, ruleGroups: unknown[]): Promise<void> {
  await page.goto("/popup.html");
  await page.evaluate(
    ({ key, groups }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          ruleGroups: groups,
          unlocks: [],
          onboardingCompleted: true,
          remindedSessionIds: []
        })
      );
      localStorage.setItem("goodnightGuard.events", "[]");
    },
    { key: SETTINGS_KEY, groups: ruleGroups }
  );
}

async function mockActiveTabUrl(page: import("@playwright/test").Page, url: string): Promise<void> {
  await page.addInitScript((activeUrl) => {
    Object.assign(window, {
      chrome: {
        tabs: {
          query: (_query: unknown, callback: (tabs: Array<{ url: string }>) => void) => callback([{ url: activeUrl }])
        },
        runtime: {
          getURL: (path: string) => `/${path}`,
          openOptionsPage: () => undefined
        }
      }
    });
  }, url);
}

async function injectReminderOverlay(page: import("@playwright/test").Page): Promise<void> {
  await page.addScriptTag({ type: "module", url: "/src/content/reminder-overlay.ts" });
}

async function buildReminderRuleGroup(page: import("@playwright/test").Page, host = "127.0.0.1"): Promise<unknown> {
  return page.evaluate((targetHost) => {
    const now = new Date();
    const startsAt = new Date(now.getTime() + 10 * 60000);
    const endsAt = new Date(now.getTime() + 70 * 60000);
    const clock = (date: Date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    return {
      id: "test-reminder",
      name: "测试提醒",
      enabled: true,
      schedule: {
        enabled: true,
        startTime: clock(startsAt),
        endTime: clock(endsAt),
        days: [startsAt.getDay()]
      },
      sites: [{ id: "target", host: targetHost, createdAt: "" }],
      commitment: "先把这一页收尾，然后离开屏幕。",
      blockPage: {
        version: 1,
        title: "现在是限制时间",
        description: "测试阻断页。",
        primaryActionLabel: "关闭页面",
        primaryAction: {
          type: "close",
          externalUrl: "",
          handoffTitle: "下一步",
          handoffHtml: ""
        },
        tone: "sleep",
        customHtmlEnabled: false,
        customHtml: ""
      },
      reminderMinutes: 15,
      blockMode: "standard",
      unlockMinutes: 10,
      maxUnlocksPerSession: 3,
      recordUnlockReason: true,
      createdAt: ""
    };
  }, host);
}

async function buildActiveRuleGroup(page: import("@playwright/test").Page, host = "127.0.0.1"): Promise<unknown> {
  return page.evaluate((targetHost) => {
    const now = new Date();
    const startsAt = new Date(now.getTime() - 10 * 60000);
    const endsAt = new Date(now.getTime() + 50 * 60000);
    const clock = (date: Date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

    return {
      id: "work-focus",
      name: "工作时间专注",
      enabled: true,
      schedule: {
        enabled: true,
        startTime: clock(startsAt),
        endTime: clock(endsAt),
        days: [now.getDay()]
      },
      sites: [{ id: "target", host: targetHost, createdAt: "" }],
      commitment: "先完成今天最重要的工作。",
      blockPage: {
        version: 1,
        title: "现在是专注时间",
        description: "视频站点先暂停，回到今天的主线。",
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
      createdAt: ""
    };
  }, host);
}
