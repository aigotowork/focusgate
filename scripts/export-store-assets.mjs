import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);

const assets = [
  {
    source: "public/store/promo-tile-440x280.source.svg",
    output: "public/store/promo-tile-440x280.png",
    width: 440,
    height: 280
  },
  {
    source: "public/store/marquee-1400x560.source.svg",
    output: "public/store/marquee-1400x560.png",
    width: 1400,
    height: 560
  }
];

function assertRsvgConvertAvailable() {
  const result = spawnSync("rsvg-convert", ["--version"], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error("rsvg-convert is required to export store PNG assets. Install librsvg, then rerun npm run store:assets.");
  }
}

function removeSourceLabels(svg) {
  return svg
    .replace(/<text\b[^>]*>\s*SOURCE TEMPLATE(?:\s*·\s*NOT FINAL STORE ART)?\s*<\/text>/g, "")
    .replace(/<text\b[^>]*>\s*SOURCE TEMPLATE\s*<\/text>/g, "");
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

function exportAsset(asset) {
  const sourcePath = resolve(root, asset.source);
  const outputPath = resolve(root, asset.output);
  const tempDir = mkdtempSync(join(tmpdir(), "focusgate-store-assets-"));
  const tempSvg = join(tempDir, basename(asset.source).replace(".source.svg", ".export.svg"));

  try {
    const svg = removeSourceLabels(readFileSync(sourcePath, "utf8"));
    writeFileSync(tempSvg, svg);

    const result = spawnSync(
      "rsvg-convert",
      ["--format", "png", "--width", String(asset.width), "--height", String(asset.height), "--output", outputPath, tempSvg],
      { encoding: "utf8" }
    );

    if (result.status !== 0) {
      throw new Error(result.stderr || `Failed to export ${asset.output}`);
    }

    const dimensions = readPngDimensions(outputPath);
    if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
      throw new Error(`${asset.output} exported at ${dimensions.width}x${dimensions.height}, expected ${asset.width}x${asset.height}.`);
    }

    console.log(`Exported ${asset.output} (${asset.width}x${asset.height})`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

assertRsvgConvertAvailable();
assets.forEach(exportAsset);
