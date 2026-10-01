import { Photo } from "../components/Photo";
import { Print } from "../components/Print";
import { Kicker, Words } from "../components/Type";
import { useEntrance } from "../components/anim";
import { color, safe } from "../design/tokens";
import type { SceneOf } from "../video/schema";
import { Page, type PageInfo } from "./common";

// A loose spread of up to five prints above the title, in reading order.
const SPREAD = [
  { left: 60, top: 250, rotate: -5 },
  { left: 380, top: 200, rotate: 3 },
  { left: 690, top: 270, rotate: -2 },
  { left: 200, top: 540, rotate: 2.5 },
  { left: 540, top: 560, rotate: -3.5 },
];
const SPREAD_PRINT = { w: 300, h: 300 };

// Closing card: soft full-bleed light, and what comes next, with no recap.
export const Next: React.FC<{ scene: SceneOf<"next">; info: PageInfo }> = ({ scene, info }) => {
  const veil = useEntrance(-0.3, 1.4);
  return (
    <Page info={info}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.4 + 0.6 * veil }}>
        <Photo photo={scene.photo} style={{ width: "100%", height: "100%" }} />
      </div>
      {/* Mist lifts the lower half so the type sits on light, not on a dark scrim. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(248,244,236,0) 30%, rgba(248,244,236,0.78) 62%, rgba(248,244,236,0.9) 100%)",
        }}
      />
      {scene.prints.map((photo, i) => (
        <Print
          key={photo.src}
          photo={photo}
          at={0.1 + i * 0.12}
          width={SPREAD_PRINT.w}
          height={SPREAD_PRINT.h}
          rotate={SPREAD[i].rotate}
          lengthSec={0.9}
          style={{ left: SPREAD[i].left, top: SPREAD[i].top }}
        />
      ))}
      <Kicker text={scene.kicker} at={0.4} style={{ position: "absolute", top: 890, left: safe.left, fontSize: 60 }} />
      <Words
        text={scene.headline}
        at={0.7}
        size={140}
        emColor="olive"
        style={{ position: "absolute", top: 960, left: safe.left, right: safe.right, color: color.ink }}
      />
    </Page>
  );
};
