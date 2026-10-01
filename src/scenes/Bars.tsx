import { useVideoConfig } from "remotion";
import { progress, usePageFrame } from "../components/anim";
import { Chip } from "../components/Print";
import { FadeUp, Kicker, Rich, Words } from "../components/Type";
import { serif, serifItalic } from "../design/fonts";
import { ease } from "../design/motion";
import { color, safe, type } from "../design/tokens";
import type { SceneOf } from "../video/schema";
import { Page, type PageInfo } from "./common";

const ROWS = { top: 470, step: 420 };
const BAR = { offset: 88, h: 130 };
// Bars stop short of the right button column so right-aligned labels keep clear of it.
const WIDTH = 1080 - safe.left - safe.right - 24;

// Variants as proportion bars that fill from the left, one row after another.
export const Bars: React.FC<{ scene: SceneOf<"bars">; info: PageInfo }> = ({ scene, info }) => {
  const frame = usePageFrame();
  const { fps } = useVideoConfig();
  const rowAt = (i: number) => 0.4 + i * 1.0;
  return (
    <Page info={info}>
      <Kicker text={scene.kicker} at={0.1} style={{ position: "absolute", top: safe.top + 20, left: safe.left }} />
      <Words
        text={scene.headline}
        at={0.3}
        size={type.headline}
        style={{ position: "absolute", top: safe.top + 80, left: safe.left, right: safe.right + 24 }}
      />
      {scene.rows.map((row, r) => {
        const top = ROWS.top + r * ROWS.step;
        const at = rowAt(r);
        const fill = progress(frame, fps, at + 0.2, 0.8, ease.drift);
        let x = 0;
        const parts = row.parts.map((part) => {
          const start = x;
          x += part.share;
          return { ...part, start };
        });
        return (
          <div key={row.title}>
            <FadeUp
              at={at}
              style={{ position: "absolute", top, left: safe.left, fontFamily: serifItalic, fontStyle: "italic", fontSize: type.body, color: color.olive }}
            >
              {row.title}
            </FadeUp>
            <div
              style={{
                position: "absolute",
                top: top + BAR.offset,
                left: safe.left,
                width: WIDTH,
                height: BAR.h,
                borderRadius: 3,
                overflow: "hidden",
                background: "rgba(46,34,25,0.05)",
                clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)`,

              }}
            >
              {parts.map((part) => (
                <div
                  key={part.label}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${part.start * 100}%`,
                    width: `${part.share * 100}%`,
                    background: color[part.color],
                    borderLeft: part.start > 0 ? `3px solid ${color.mist}` : undefined,
                  }}
                />
              ))}
            </div>
            {parts.map((part, k) => {
              // Narrow parts right-align their label to the bar's end so it never overflows.
              const narrow = part.share < 0.35 && part.start > 0;
              return (
                <FadeUp
                  key={part.label}
                  at={at + 0.5 + k * 0.2}
                  style={{
                    position: "absolute",
                    top: top + BAR.offset + BAR.h + 18,
                    ...(narrow
                      ? { right: safe.right + 24, textAlign: "right" as const }
                      : { left: safe.left + part.start * WIDTH }),
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexDirection: narrow ? ("row-reverse" as const) : ("row" as const),
                    fontFamily: serif,
                    fontSize: type.body,
                    color: color.ink,
                  }}
                >
                  {part.photo ? <Chip photo={part.photo} at={at + 0.5 + k * 0.2} size={92} /> : null}
                  {part.label}
                </FadeUp>
              );
            })}
            {row.note ? (
              <FadeUp
                at={at + 0.6 + parts.length * 0.2}
                style={{
                  position: "absolute",
                  top: top + BAR.offset + BAR.h + 130,
                  left: safe.left,
                  right: safe.right,
                  fontFamily: serifItalic,
                  fontStyle: "italic",
                  fontSize: type.caption,
                  color: color.walnut,
                }}
              >
                <Rich text={row.note} emColor="inherit" />
              </FadeUp>
            ) : null}
          </div>
        );
      })}
    </Page>
  );
};
