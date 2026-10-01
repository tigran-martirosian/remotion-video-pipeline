// Renders sample frames of a composition plus a contact sheet, for fast visual review.
//
//   npm run preview -- <compositionId> [--every=1.5] [--frames=0,45,120] [--out=dir]
//
// Output: out/previews/<id>/frame-XXXX.png and out/previews/<id>/sheet.jpg
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import {
  openBrowser,
  renderStill,
  selectComposition,
} from "@remotion/renderer";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const opt = (name) =>
  args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
if (!id) {
  console.error(
    "Usage: npm run preview -- <compositionId> [--every=seconds] [--frames=a,b,c]",
  );
  process.exit(1);
}

const root = process.cwd();
// A separate bundle per output folder, so parallel previews never share files.
const bundleDir = path.join(
  root,
  "out",
  opt("out") ? `.bundle-${path.basename(opt("out"))}` : ".bundle",
);
const outDir = opt("out")
  ? path.resolve(root, opt("out"))
  : path.join(root, "out", "previews", id);

execFileSync(
  "npx",
  ["remotion", "bundle", `--out-dir="${bundleDir}"`, "--quiet"],
  {
    stdio: "inherit",
    shell: true,
  },
);

const browser = await openBrowser("chrome");
// --set=style.font=record,style.tape=false overrides props (values: true/false/number/string),
// to compare Studio options without editing the topic file.
const base = await selectComposition({
  serveUrl: bundleDir,
  id,
  puppeteerInstance: browser,
});
let composition = base;
if (opt("set")) {
  const props = structuredClone(base.props);
  for (const pair of opt("set").split(",")) {
    const [key, raw] = pair.split("=");
    const value =
      raw === "true"
        ? true
        : raw === "false"
          ? false
          : isNaN(Number(raw))
            ? raw
            : Number(raw);
    const keys = key.split(".");
    let o = props;
    for (const k of keys.slice(0, -1)) o = o[k] ??= {};
    o[keys.at(-1)] = value;
  }
  composition = await selectComposition({
    serveUrl: bundleDir,
    id,
    inputProps: props,
    puppeteerInstance: browser,
  });
}

let frames;
if (opt("frames")) {
  frames = opt("frames").split(",").map(Number);
} else {
  const step = Math.max(
    1,
    Math.round(Number(opt("every") ?? 1.5) * composition.fps),
  );
  frames = [];
  for (let f = 0; f < composition.durationInFrames; f += step) frames.push(f);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const [i, frame] of frames.entries()) {
  const output = path.join(outDir, `frame-${String(i).padStart(4, "0")}.png`);
  await renderStill({
    composition,
    serveUrl: bundleDir,
    frame,
    output,
    puppeteerInstance: browser,
  });
  console.log(
    `frame ${frame} (${(frame / composition.fps).toFixed(2)}s) -> ${path.relative(root, output)}`,
  );
}
await browser.close({ silent: true });

const cols = Math.min(frames.length, 6);
const rows = Math.ceil(frames.length / cols);
execFileSync(
  "ffmpeg",
  [
    "-loglevel",
    "error",
    "-y",
    "-framerate",
    "1",
    "-i",
    path.join(outDir, "frame-%04d.png"),
    "-vf",
    `scale=270:480,tile=${cols}x${rows}:padding=8:color=0x2E2219`,
    "-frames:v",
    "1",
    path.join(outDir, "sheet.jpg"),
  ],
  { stdio: "inherit" },
);
console.log(
  `contact sheet -> ${path.relative(root, path.join(outDir, "sheet.jpg"))}`,
);
