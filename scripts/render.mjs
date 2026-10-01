// Final render of a topic into a versioned file. Quality settings come from remotion.config.ts.
//
//   npm run render -- <compositionId>
//
// Output: out/renders/<id>/<id>_<YYYY-MM-DD_HHMM>.mp4
import { execFileSync } from "node:child_process";
import path from "node:path";

const id = process.argv[2];
if (!id) {
  console.error("Usage: npm run render -- <compositionId>");
  process.exit(1);
}

// Local time, so filenames carry the user's date (UTC ran a day ahead in the evening).
const now = new Date();
const two = (n) => String(n).padStart(2, "0");
const stamp = `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}_${two(now.getHours())}${two(now.getMinutes())}`;
const output = path.join("out", "renders", id, `${id}_${stamp}.mp4`);

// Extra flags go to Remotion (e.g. `--muted` when audio is added in the publishing app).
execFileSync(
  "npx",
  ["remotion", "render", id, `"${output}"`, ...process.argv.slice(3)],
  {
    stdio: "inherit",
    shell: true,
  },
);
console.log(`-> ${output}`);
