// Tile any set of images into one contact sheet (handles mixed sizes/formats).
//
//   node scripts/sheet.mjs <out.jpg> <img...> [--tile=400] [--cols=5]
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name, fallback) =>
  Number(args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback);
const [out, ...inputs] = args.filter((a) => !a.startsWith("--"));
if (!out || inputs.length === 0) {
  console.error("Usage: node scripts/sheet.mjs <out.jpg> <img...> [--tile=400] [--cols=5]");
  process.exit(1);
}

const tile = opt("tile", 400);
const cols = Math.min(opt("cols", 5), inputs.length);
const rows = Math.ceil(inputs.length / cols);
const tmp = mkdtempSync(path.join(tmpdir(), "sheet-"));

inputs.forEach((input, i) => {
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y", "-i", input,
    "-vf", `scale=${tile}:${tile}:force_original_aspect_ratio=decrease,pad=${tile}:${tile}:(ow-iw)/2:(oh-ih)/2:color=0x2E2219`,
    "-pix_fmt", "rgb24", "-frames:v", "1", path.join(tmp, `${String(i).padStart(3, "0")}.png`),
  ]);
});
execFileSync("ffmpeg", [
  "-loglevel", "error", "-y", "-framerate", "1", "-i", path.join(tmp, "%03d.png"),
  "-vf", `tile=${cols}x${rows}:padding=6:color=0x2E2219`, "-frames:v", "1", out,
]);
rmSync(tmp, { recursive: true, force: true });
console.log(`${inputs.length} images -> ${out}`);
