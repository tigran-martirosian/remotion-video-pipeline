import { DrawPath } from "../components/Graphics";
import { Print } from "../components/Print";
import { FadeUp, Kicker, Rich, Words } from "../components/Type";
import { serif, serifItalic } from "../design/fonts";
import { color, safe, type } from "../design/tokens";
import type { SceneOf } from "../video/schema";
import { Page, type PageInfo } from "./common";

const ROW = { top: 590, h: 400, gap: 56 };
const ROTATE = [-2.5, 1.5, -1.5];

// Steps as a row of prints that drop in one after another, joined by drawn arrows, each
// with a caption underneath; a note below.
export const Steps: React.FC<{ scene: SceneOf<"steps">; info: PageInfo }> = ({ scene, info }) => {
  const n = scene.steps.length;
  const w = Math.floor((1080 - safe.left - safe.right - ROW.gap * (n - 1)) / n);
  const stepAt = (i: number) => 0.4 + i * 0.55;
  const left = (i: number) => safe.left + i * (w + ROW.gap);
  const noteAt = stepAt(n - 1) + 0.7;
  return (
    <Page info={info}>
      <Kicker text={scene.kicker} at={0.1} style={{ position: "absolute", top: safe.top + 20, left: safe.left }} />
      <Words
        text={scene.headline}
        at={0.3}
        size={type.headline}
        style={{ position: "absolute", top: safe.top + 80, left: safe.left, right: safe.right + 24 }}
      />
      {scene.steps.map((step, i) => (
        <div key={step.label}>
          <Print
            photo={step.photo}
            at={stepAt(i)}
            width={w}
            height={ROW.h}
            rotate={ROTATE[i]}
            from={-60}
            style={{ left: left(i), top: ROW.top }}
          />
          <FadeUp
            at={stepAt(i) + 0.4}
            style={{
              position: "absolute",
              left: left(i) + 6,
              width: w,
              top: ROW.top + ROW.h + 34,
              fontFamily: serifItalic,
              fontStyle: "italic",
              fontSize: type.body,
              color: color.olive,
            }}
          >
            {step.label}
          </FadeUp>
        </div>
      ))}
      {/* Arrows arc over each gap, drawn after the prints so a landing print never covers them. */}
      {scene.steps.slice(0, -1).map((step, i) => (
        <DrawPath
          key={`arrow-${step.label}`}
          viewBox="0 0 120 70"
          d="M 8 52 C 34 8, 84 8, 110 46 M 96 38 L 111 48 L 94 56"
          at={stepAt(i) + 0.45}
          lengthSec={0.5}
          length={200}
          stroke={color.walnut}
          width={3.5}
          style={{ left: left(i) + w + ROW.gap / 2 - 60, top: ROW.top - 78, width: 120, height: 70, opacity: 0.8 }}
        />
      ))}
      {scene.note ? (
        <FadeUp
          at={noteAt}
          style={{
            position: "absolute",
            left: safe.left,
            right: safe.right,
            top: ROW.top + ROW.h + 150,
            fontFamily: serif,
            fontSize: type.body,
            lineHeight: 1.22,
            color: color.ink,
          }}
        >
          <Rich text={scene.note} />
        </FadeUp>
      ) : null}
    </Page>
  );
};
