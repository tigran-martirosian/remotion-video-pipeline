// Automated QA for a topic video.
//   npm run check -- <compositionId> [--scenes=1,4,5] [--out=dir]
// Checks text against the TikTok safe area, how long each page holds still, and reading time.
// Writes out/check/<id>/report.md, one PNG per scene and sheet.jpg. Exits with 1 when a scene FAILs.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  openBrowser,
  renderStill,
  selectComposition,
} from "@remotion/renderer";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const opt = (name) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
if (!id) {
  console.error(
    "Usage: npm run check -- <compositionId> [--scenes=1,4] [--out=dir]",
  );
  process.exit(1);
}

// Mirrors src/design/tokens.ts `safe` and TRANSITION_FRAMES in src/video/TopicVideo.tsx.
const W = 1080;
const H = 1920;
const SAFE = { top: 160, bottom: 430, left: 70, right: 150 };
const RIGHT_MARGIN = 20;
const TRANSITION_FRAMES = { page: 22, stack: 20 };
// A pixel counts as changed when its grey level moves by more than this (0 to 255).
const PIXEL_DELTA = 18;
// Ignore specks smaller than this many pixels (antialiasing, dithering).
const MIN_PIXELS = 40;
const HOLD_MIN = 1.0;
const HOLD_MAX = 2.6;
// A floor, not a target: a comfortable on-screen reading pace for short copy.
const WORDS_PER_SEC = 6;
const READ_EXTRA_SEC = 1;
const HOLD_SCAN_SEC = 4;
const HOLD_STEP = 3;

const root = process.cwd();
const outDir = opt("out")
  ? path.resolve(root, opt("out"))
  : path.join(root, "out", "check", id);
const bundleDir = path.join(
  root,
  "out",
  `.bundle-check-${path.basename(outDir)}`,
);
const tmpDir = path.join(outDir, "tmp");

execFileSync(
  "npx",
  ["remotion", "bundle", `--out-dir="${bundleDir}"`, "--quiet"],
  { stdio: "inherit", shell: true },
);
const browser = await openBrowser("chrome");
const normal = await selectComposition({
  serveUrl: bundleDir,
  id,
  puppeteerInstance: browser,
});
const probeProps = { ...normal.props, probe: "hideText" };
const probe = await selectComposition({
  serveUrl: bundleDir,
  id,
  inputProps: probeProps,
  puppeteerInstance: browser,
});
const { topic } = normal.props;
const fps = normal.fps;
rmSync(outDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });

// Scene start frames, as in timeline() in TopicVideo.tsx.
let t = 0;
const scenes = topic.scenes.map((scene, i) => {
  if (i > 0) t -= TRANSITION_FRAMES[scene.enter ?? "page"];
  const start = t;
  const frames = Math.round(scene.durationSec * fps);
  t += frames;
  return { i, scene, start, frames };
});
// The last frame a page is fully on screen: just before the next page starts turning in.
scenes.forEach((s, i) => {
  s.lastClean =
    i + 1 < scenes.length ? scenes[i + 1].start - 1 : s.start + s.frames - 1;
});

const cache = new Map();
const render = async (frame, withText = true) => {
  const key = `${frame}-${withText}`;
  if (cache.has(key)) return cache.get(key);
  const output = path.join(tmpDir, `${withText ? "f" : "p"}-${frame}.png`);
  await renderStill({
    composition: withText ? normal : probe,
    serveUrl: bundleDir,
    frame,
    output,
    inputProps: withText ? normal.props : probeProps,
    puppeteerInstance: browser,
  });
  cache.set(key, output);
  return output;
};

// Grey-level absolute difference of two images as a raw W×H buffer.
const diff = (a, b) =>
  execFileSync(
    "ffmpeg",
    [
      "-loglevel",
      "error",
      "-i",
      a,
      "-i",
      b,
      "-filter_complex",
      "[0][1]blend=all_mode=difference,format=gray",
      "-f",
      "rawvideo",
      "-",
    ],
    { maxBuffer: W * H * 2 },
  );

const changed = (buf, inside = () => true) => {
  let n = 0;
  let box = null;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (buf[y * W + x] <= PIXEL_DELTA || !inside(x, y)) continue;
      n++;
      if (!box) box = { x0: x, y0: y, x1: x, y1: y };
      else {
        box.x0 = Math.min(box.x0, x);
        box.x1 = Math.max(box.x1, x);
        box.y0 = Math.min(box.y0, y);
        box.y1 = Math.max(box.y1, y);
      }
    }
  }
  return n >= MIN_PIXELS ? { n, box } : null;
};

const outsideSafe = (x, y) =>
  x < SAFE.left || x >= W - SAFE.right || y < SAFE.top || y >= H - SAFE.bottom;
const nearRight = (x, y) =>
  !outsideSafe(x, y) && x >= W - SAFE.right - RIGHT_MARGIN;

// Visible copy: every string in the scene except file paths, framing and bookkeeping.
const SKIP = new Set([
  "type",
  "src",
  "focus",
  "tone",
  "source",
  "enter",
  "color",
  "motion",
  "layout",
]);
const words = (value, key) => {
  if (typeof value === "string")
    return SKIP.has(key)
      ? 0
      : value.replace(/\*/g, "").split(/\s+/).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((n, v) => n + words(v, key), 0);
  if (value && typeof value === "object")
    return Object.entries(value).reduce((n, [k, v]) => n + words(v, k), 0);
  return 0;
};

const only = opt("scenes")?.split(",").map(Number);
const rows = [];
const shots = [];
let failed = false;

for (const s of scenes) {
  if (only && !only.includes(s.i + 1)) continue;
  const label = `${String(s.i + 1).padStart(2, "0")} ${s.scene.type}`;
  const issues = [];
  const boxes = [];

  // 1. Safe area: on the settled frame and mid-page (catches text entering from off-page).
  const mid = s.start + Math.round((s.lastClean - s.start) / 2);
  for (const frame of [mid, s.lastClean]) {
    const text = diff(await render(frame), await render(frame, false));
    const out = changed(text, outsideSafe);
    if (out) {
      issues.push(
        `FAIL text outside safe area at ${(frame / fps).toFixed(2)}s (${out.n}px, x ${out.box.x0}–${out.box.x1}, y ${out.box.y0}–${out.box.y1})`,
      );
      boxes.push(out.box);
      failed = true;
    }
    const tight = changed(text, nearRight);
    if (tight && frame === s.lastClean) {
      issues.push(
        `WARN text within ${RIGHT_MARGIN}px of the right button column (y ${tight.box.y0}–${tight.box.y1})`,
      );
      boxes.push(tight.box);
    }
  }

  // 2. Settle / hold: walk back from the last clean frame until the page differs from it.
  const last = await render(s.lastClean);
  let holdText;
  let settledAt = null;
  let movingBox = null;
  const earliest = Math.max(s.start, s.lastClean - HOLD_SCAN_SEC * fps);
  for (let f = s.lastClean - HOLD_STEP; f >= earliest; f -= HOLD_STEP) {
    const moved = changed(diff(await render(f), last));
    if (moved) {
      settledAt = f + HOLD_STEP;
      movingBox = moved.box;
      break;
    }
  }
  if (settledAt === null) {
    holdText = `≥${((s.lastClean - earliest) / fps).toFixed(1)}s`;
    if ((s.lastClean - earliest) / fps > HOLD_MAX) {
      issues.push(
        `WARN static for ≥${((s.lastClean - earliest) / fps).toFixed(1)}s before the page turn, shorten the page or add a beat`,
      );
    }
  } else {
    const hold = (s.lastClean - settledAt) / fps;
    holdText = `${hold.toFixed(1)}s`;
    if (hold < 0.2) {
      const where = `x ${movingBox.x0}–${movingBox.x1}, y ${movingBox.y0}–${movingBox.y1}`;
      issues.push(
        `WARN still moving at the page turn (${where}) — intended loop, or trembling?`,
      );
    } else if (hold < HOLD_MIN) {
      issues.push(
        `WARN last beat lands only ${hold.toFixed(1)}s before the turn — too little time to read`,
      );
    } else if (hold > HOLD_MAX) {
      issues.push(
        `WARN holds still ${hold.toFixed(1)}s — trim the page (≈2s after the last beat is plenty)`,
      );
    }
  }

  // 3. Reading time.
  const n = words(s.scene);
  const need = n / WORDS_PER_SEC + READ_EXTRA_SEC;
  if (s.scene.durationSec < need) {
    issues.push(
      `WARN ${n} words need ≈${need.toFixed(1)}s, page is ${s.scene.durationSec}s`,
    );
  }

  // Settled frame with the safe area and any offending text marked.
  const shot = path.join(
    outDir,
    `scene-${String(s.i + 1).padStart(2, "0")}.png`,
  );
  const draw = [
    `drawbox=x=${SAFE.left}:y=${SAFE.top}:w=${W - SAFE.left - SAFE.right}:h=${H - SAFE.top - SAFE.bottom}:color=0xA9623F@0.8:t=3`,
    ...boxes.map(
      (b) =>
        `drawbox=x=${b.x0 - 6}:y=${b.y0 - 6}:w=${b.x1 - b.x0 + 12}:h=${b.y1 - b.y0 + 12}:color=red@0.9:t=5`,
    ),
  ].join(",");
  execFileSync("ffmpeg", [
    "-loglevel",
    "error",
    "-y",
    "-i",
    last,
    "-vf",
    draw,
    shot,
  ]);
  shots.push(shot);

  const verdict = issues.some((x) => x.startsWith("FAIL"))
    ? "FAIL"
    : issues.length
      ? "warn"
      : "ok";
  rows.push({
    label,
    secs: `${(s.start / fps).toFixed(1)}–${((s.lastClean + 1) / fps).toFixed(1)}s`,
    n,
    hold: holdText,
    verdict,
    issues,
  });
  console.log(`${verdict.padEnd(4)} ${label}`);
}
await browser.close({ silent: true });

const report = [
  `# Check — ${id}`,
  "",
  "| scene | on screen | words | holds still | result |",
  "|---|---|---|---|---|",
  ...rows.map(
    (r) => `| ${r.label} | ${r.secs} | ${r.n} | ${r.hold} | ${r.verdict} |`,
  ),
  "",
  ...rows.flatMap((r) =>
    r.issues.length
      ? [`## ${r.label}`, ...r.issues.map((x) => `- ${x}`), ""]
      : [],
  ),
].join("\n");
writeFileSync(path.join(outDir, "report.md"), report);
execFileSync(
  "node",
  [
    path.join(root, "scripts", "sheet.mjs"),
    path.join(outDir, "sheet.jpg"),
    ...shots,
    "--tile=480",
    "--cols=6",
  ],
  {
    stdio: "ignore",
  },
);
rmSync(tmpDir, { recursive: true, force: true });
console.log(`\n${report}\n\nframes + sheet -> ${path.relative(root, outDir)}`);
process.exit(failed ? 1 : 0);
