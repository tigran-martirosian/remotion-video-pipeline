import { Print } from "../components/Print";
import { FadeUp, Kicker, Words } from "../components/Type";
import { sans } from "../design/fonts";
import { color } from "../design/tokens";
import { safe } from "../design/tokens";
import type { SceneOf } from "../video/schema";
import { Page, type PageInfo } from "./common";

// Back cover: snapshots laid on the paper, then the short version as stacked serif lines,
// one per beat, landing early enough to be read and held.
const PRINTS = [
  { left: 60, top: 250, w: 540, h: 620, rotate: -4 },
  { left: 520, top: 330, w: 470, h: 540, rotate: 3.5 },
];

export const Takeaway: React.FC<{ scene: SceneOf<"takeaway">; info: PageInfo }> = ({ scene, info }) => (
  <Page info={info}>
    {scene.photos.map((photo, i) => {
      const p = PRINTS[i];
      return (
        <Print key={photo.src} photo={photo} at={-0.3 + i * 0.35} width={p.w} height={p.h} rotate={p.rotate} style={{ left: p.left, top: p.top }} />
      );
    })}
    <Kicker text={scene.kicker} at={0.5} style={{ position: "absolute", top: 922, left: safe.left }} />
    <FadeUp
      at={0.9 + scene.lines.length * 0.42 + 0.9}
      style={{
        position: "absolute",
        top: 918,
        right: safe.right,
        fontFamily: sans,
        fontWeight: 300,
        fontSize: 40,
        color: color.walnut,
      }}
    >
      {info.masthead}
    </FadeUp>
    <div style={{ position: "absolute", top: 975, left: safe.left, right: safe.right }}>
      {scene.lines.map((line, i) => (
        <Words key={line} text={line} at={0.7 + i * 0.42} size={92} emColor="olive" style={{ lineHeight: 1.06 }} />
      ))}
    </div>
  </Page>
);
