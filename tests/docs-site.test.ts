import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const docsRoot = resolve(process.cwd(), "docs");

const localizedRoutes = [
  {
    name: "home",
    zh: "index.html",
    en: "en/index.html",
    fr: "fr/index.html"
  },
  {
    name: "privacy",
    zh: "privacy/index.html",
    en: "en/privacy/index.html",
    fr: "fr/privacy/index.html"
  },
  {
    name: "support",
    zh: "support/index.html",
    en: "en/support/index.html",
    fr: "fr/support/index.html"
  }
] as const;

const expectedHreflangs = ["en", "fr", "x-default", "zh-CN"];
const expectedLanguages = ["en", "fr", "zh"];

function readDocsFile(relativePath: string): string {
  return readFileSync(join(docsRoot, relativePath), "utf8");
}

function attributeValues(html: string, name: string): string[] {
  return [...html.matchAll(new RegExp(`${name}="([^"]+)"`, "g"))].map((match) => match[1]);
}

describe("public docs localization", () => {
  it("keeps every route available in Chinese, English, and French", () => {
    for (const route of localizedRoutes) {
      for (const relativePath of [route.zh, route.en, route.fr]) {
        expect(existsSync(join(docsRoot, relativePath)), `${route.name} missing ${relativePath}`).toBe(true);
      }
    }
  });

  it("keeps localized pages mutually discoverable", () => {
    for (const route of localizedRoutes) {
      for (const [language, relativePath] of Object.entries(route)) {
        if (language === "name") {
          continue;
        }

        const html = readDocsFile(relativePath);
        expect(attributeValues(html, "hreflang").sort(), relativePath).toEqual(expectedHreflangs);
        expect(attributeValues(html, "data-lang").sort(), relativePath).toEqual(expectedLanguages);
        expect(html, relativePath).toContain('class="language-switcher"');
      }
    }
  });

  it("runs browser-language autodetection only on default Chinese routes", () => {
    for (const route of localizedRoutes) {
      const zhHtml = readDocsFile(route.zh);

      expect(zhHtml, route.zh).toContain('data-autodetect="true"');
      expect(zhHtml, route.zh).not.toContain("data-locale=");

      for (const localizedPath of [route.en, route.fr]) {
        const html = readDocsFile(localizedPath);

        expect(html, localizedPath).not.toContain('data-autodetect="true"');
        expect(html, localizedPath).toMatch(/data-locale="(en|fr)"/);
      }
    }
  });

  it("keeps local asset and route links resolvable", () => {
    for (const route of localizedRoutes) {
      for (const relativePath of [route.zh, route.en, route.fr]) {
        const html = readDocsFile(relativePath);
        const sourceDir = dirname(join(docsRoot, relativePath));
        const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

        for (const reference of references) {
          if (/^(https?:|mailto:|#)/.test(reference)) {
            continue;
          }

          const target = resolve(sourceDir, reference);

          if (reference.endsWith("/")) {
            expect(existsSync(join(target, "index.html")), `${relativePath} -> ${reference}`).toBe(true);
            continue;
          }

          expect(existsSync(target), `${relativePath} -> ${reference}`).toBe(true);
        }
      }
    }
  });
});
