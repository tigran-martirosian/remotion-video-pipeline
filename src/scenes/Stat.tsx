import { useEntrance } from "../components/anim";
import { PopText } from "../components/Graphics";
import { Photo } from "../components/Photo";
import { Print } from "../components/Print";
import { FadeUp, Kicker, Rich } from "../components/Type";
import { serif, serifItalic } from "../design/fonts";
import { color, safe, type } from "../design/tokens";
import type { SceneOf } from "../video/schema";
import { Page, type PageInfo } from "./common";

// One counted number that owns the page.
//  stack: number on top, lines, an arched photo to the bottom edge.
//  split: tall photo on the left edge, number and lines on the right.
const PRINT_SLOTS = {
  stack: [{ right: safe.right, top: 800, w: 300, h: 360, rotate: -4 }],
  split: [
    { left: 490, top: 1030, w: 250, h: 300, rotate: -3 },
    { left: 680, top: 1080, w: 240, h: 290, rotate: 4 },
  ],
};

export const Stat: React.FC<{ scene: SceneOf<"stat">; info: PageInfo }> = ({ scene, info }) => {
  const photoIn = useEntrance(-0.2, 1.3);
  const numberIn = useEntrance(0.1, 0.6);
  const split = scene.layout === "split";
  const textLeft = split ? 490 : safe.left;
  const slots = PRINT_SLOTS[scene.layout];

  return (
    <Page info={info} tone={split ? "cream" : "mist"}>
      {split ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 260,
            width: 440,
            height: 1180,
            borderRadius: "0 220px 0 0",
            overflow: "hidden",
            clipPath: `inset(0 ${(1 - photoIn) * 100}% 0 0)`,
          }}
        >
          <Photo photo={scene.photo} style={{ width: "100%", height: "100%" }} />
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 960,
            bottom: 0,
            borderRadius: "540px 540px 0 0",
            overflow: "hidden",
            clipPath: `inset(${(1 - photoIn) * 100}% 0 0 0)`,
          }}
        >
          <Photo photo={scene.photo} style={{ width: "100%", height: "100%" }} />
        </div>
      )}
      <Kicker text={scene.kicker} at={0} style={{ position: "absolute", top: safe.top + (split ? 90 : 20), left: textLeft }} />
      <div
        style={{
          position: "absolute",
          left: textLeft - 8,
          top: split ? safe.top + 160 : safe.top + 90,
          fontFamily: serif,
          fontSize: split ? type.stat : type.stat + 20,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: color.ink,
          opacity: numberIn,
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
        }}
      >
        <PopText value={scene.stat.value} at={0.1} />
        {scene.stat.unit ? (
          <span style={{ fontFamily: serifItalic, fontStyle: "italic", fontSize: split ? 84 : 110, marginLeft: 14, color: color.olive }}>
            {scene.stat.unit}
          </span>
        ) : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: textLeft,
          right: safe.right,
          top: split ? safe.top + 400 : safe.top + 400,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {scene.lines.map((line, i) => (
          <FadeUp key={line} at={1.3 + i * 0.9}>
            <div style={{ fontFamily: serif, fontSize: type.body + 4, lineHeight: 1.15, color: color.ink }}>
              <Rich text={line} emColor="terracotta" />
            </div>
          </FadeUp>
        ))}
      </div>
      {scene.prints.slice(0, slots.length).map((photo, i) => {
        const { w, h, rotate, ...pos } = slots[i];
        return <Print key={photo.src} photo={photo} at={2.0 + i * 0.5} width={w} height={h} rotate={rotate} style={pos} />;
      })}
    </Page>
  );
};
