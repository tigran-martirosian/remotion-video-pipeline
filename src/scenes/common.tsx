import { AbsoluteFill } from "remotion";
import { Paper } from "../components/Paper";
import { sans } from "../design/fonts";
import { color, safe } from "../design/tokens";
import type { Photo } from "../video/schema";

// What every scene template receives besides its own data.
export type PageInfo = { page: number; pages: number; masthead: string; ambient?: Photo };

// An opaque, sunlit page: paper (with the scene's ambient light photo), content, and the
// quiet watermark, printed on each card, so it leaves with the card when it slides away.
// `probe-keep`: stays visible in check probes (it sits near the right column by design).
export const Page: React.FC<{
  info: PageInfo;
  children: React.ReactNode;
  tone?: "mist" | "cream" | "paper";
}> = ({ info, children, tone }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Paper tone={tone} ambient={info.ambient} />
    {children}
    <div
      className="probe-keep"
      style={{
        position: "absolute",
        top: safe.top + 26,
        right: safe.right,
        fontFamily: sans,
        fontWeight: 300,
        fontSize: 30,
        letterSpacing: "0.04em",
        color: color.walnut,
        opacity: 0.6,
      }}
    >
      {info.masthead}
    </div>
  </AbsoluteFill>
);
