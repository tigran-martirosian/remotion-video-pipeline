// Cheap motion QA from numbers, not frames: reads a rendered MP4 with ffmpeg's signalstats
// (YDIF = mean luma change from the previous frame) and prints a short report.
//   npm run motion-qa -- <video.mp4 | compositionId>
// - cuts:    frames where the picture changes a lot at once (should land on intended beats)
// - flicker: a one-frame spike that isn't a cut (something popped for a single frame)
// - tremble: long runs of tiny, non-zero change (sub-pixel drift). A deliberately rotating
//            background also shows up here, so read it against what should be moving.
import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: npm run motion-qa -- <video.mp4 | compositionId>");
  process.exit(1);
}
let file = arg;
if (!arg.endsWith(".mp4")) {
  const dir = path.join("out", "renders", arg);
  const mp4s = readdirSync(dir).filter((f) => f.endsWith(".mp4")).map((f) => path.join(dir, f));
  file = mp4s.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
}

const out = execFileSync(
  "ffmpeg",
  ["-loglevel", "error", "-i", file, "-vf", "signalstats,metadata=print:key=lavfi.signalstats.YDIF:file=-", "-f", "null", "-"],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
const ydif = [...out.matchAll(/YDIF=([\d.]+)/g)].map((m) => Number(m[1]));
const fps = 30;
const t = (f) => `${(f / fps).toFixed(2)}s`;

const CUT = 12;
const cuts = [];
const flicker = [];
for (let f = 1; f < ydif.length; f++) {
  if (ydif[f] >= CUT) cuts.push(f);
  const prev = ydif[f - 1] ?? 0;
  const next = ydif[f + 1] ?? 0;
  if (ydif[f] >= 3 && ydif[f] < CUT && ydif[f] > 4 * Math.max(prev, next, 0.25)) flicker.push(f);
}

// Runs of small, steady change: 0 < YDIF < 1.5 for at least 1 s.
const tremble = [];
let start = -1;
for (let f = 1; f <= ydif.length; f++) {
  const small = f < ydif.length && ydif[f] > 0.02 && ydif[f] < 1.5;
  if (small && start < 0) start = f;
  if (!small && start >= 0) {
    if (f - start >= fps) tremble.push([start, f - 1]);
    start = -1;
  }
}
const still = ydif.filter((v) => v <= 0.02).length;

console.log(`${path.basename(file)} — ${ydif.length} frames (${t(ydif.length)})`);
console.log(`cuts (${cuts.length}): ${cuts.map((f) => `${t(f)} [${ydif[f].toFixed(0)}]`).join(", ") || "none"}`);
console.log(`flicker (${flicker.length}): ${flicker.map((f) => `${t(f)} [${ydif[f].toFixed(1)}]`).join(", ") || "none"}`);
console.log(`steady small motion ≥1s (${tremble.length}): ${tremble.map(([a, b]) => `${t(a)}–${t(b)}`).join(", ") || "none"}`);
console.log(`fully still frames: ${still}/${ydif.length}`);
