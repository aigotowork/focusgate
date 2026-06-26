import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
const distDir = resolve(root, "dist");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const artifactsDir = resolve(root, "artifacts/chrome-web-store");
const outputZip = resolve(artifactsDir, `focusgate-${packageJson.version}.zip`);

if (!existsSync(resolve(distDir, "manifest.json"))) {
  throw new Error("dist/manifest.json is missing. Run npm run build before packaging.");
}

mkdirSync(artifactsDir, { recursive: true });
rmSync(outputZip, { force: true });

const result = spawnSync(
  "zip",
  [
    "-r",
    "-q",
    outputZip,
    ".",
    "-x",
    "*.map",
    "store/*",
    "store/**",
    ".DS_Store",
    "__MACOSX/*",
    "__MACOSX/**"
  ],
  { cwd: distDir, encoding: "utf8" }
);

if (result.status !== 0) {
  throw new Error(result.stderr || "Failed to create Chrome Web Store zip.");
}

console.log(`Created ${outputZip}`);
