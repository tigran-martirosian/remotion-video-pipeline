import { useVideoConfig } from "remotion";
import { progress, useEntrance, usePageFrame } from "../components/anim";
import { Photo } from "../components/Photo";
import { Print } from "../components/Print";
import { FadeUp, Kicker, Rich, Words } from "../components/Type";
import { serif, serifItalic } from "../design/fonts";
import { ease } from "../design/motion";
import { color, safe, type } from "../design/tokens";
import type { Photo as PhotoData, SceneOf } from "../video/schema";
import { Page, type PageInfo } from "./common";

type Box = { left: number; top: number; w: number; h: number };
type PrintBox = Box & { rotate: number };
type Layout = { hero: Box; prints: PrintBox[]; lines: { top: number; left: number; right: number } };

const HEAD_BOTTOM = safe.top + 80 + 150;
// Italic lines lean left past their box; start the lines a little inside the safe edge.
const ITALIC_INSET = safe.left + 12;

// "band": main photo left, prints stacked on the right, lines across the bottom.
// "split": a tall photo panel bleeding off the right edge, lines in a left column, one print
// under the lines.
const layoutFor = (scene: SceneOf<"spread">): Layout => {
  if (scene.layout === "split") {
    return {
      hero: { left: 590, top: 430, w: 490, h: 980 },
      prints: [{ left: 96, top: 990, w: 360, h: 420, rotate: -3 }],
      lines: { top: 470, left: ITALIC_INSET, right: 1080 - 550 },
    };
  }
  const top = scene.sub ? HEAD_BOTTOM + 100 : HEAD_BOTTOM + 30;
  const h = scene.lines.length > 0 ? 500 : 1400 - top;
  return {
    hero: { left: safe.left, top, w: 520, h },
    prints: [
      { left: 560, top: top + 20, w: 370, h: scene.lines.length > 0 ? 230 : 380, rotate: 3 },
      { left: 600, top: top + (scene.lines.length > 0 ? 260 : 460), w: 330, h: scene.lines.length > 0 ? 230 : 400, rotate: -2 },
    ],
    lines: { top: top + h + 50, left: ITALIC_INSET, right: safe.right + 24 },
  };
};

// The main photo, wiped up from the bottom like a print being uncovered.
const Hero: React.FC<{ photo: PhotoData; box: Box; at: number }> = ({ photo, box, at }) => {
  const p = useEntrance(at, 0.9);
  return (
    <div
      style={{
        position: "absolute",
        left: box.left,
        top: box.top,
        width: box.w,
        height: box.h,
        borderRadius: 6,
        overflow: "hidden",
        clipPath: `inset(${(1 - p) * 100}% 0 0 0)`,
        boxShadow: "0 16px 36px rgba(46,34,25,0.16)",
      }}
    >
      <Photo photo={photo} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

// A line whose text gets struck through by hand, followed by its unstruck note.
const Struck: React.FC<{ text: string; note?: string; at: number }> = ({ text, note, at }) => {
  const frame = usePageFrame();
  const { fps } = useVideoConfig();
  const strike = progress(frame, fps, at + 0.5, 0.5, ease.drift);
  const noteIn = progress(frame, fps, at + 0.9, 0.7);
  return (
    <FadeUp at={at}>
      <span style={{ position: "relative", display: "inline-block" }}>
        <Rich text={text} />
        {/* A slightly tilted hand line across exactly the word's width, drawn left to right. */}
        <span
          style={{
            position: "absolute",
            left: -4,
            right: -4,
            top: "54%",
            height: 5,
            borderRadius: 3,
            background: color.terracotta,
            transform: `rotate(-1.5deg) scaleX(${strike})`,
            transformOrigin: "0% 50%",
          }}
        />
      </span>
      {note ? (
        <span style={{ marginLeft: 22, fontFamily: serifItalic, fontStyle: "italic", color: color.terracotta, opacity: noteIn }}>
          {note}
        </span>
      ) : null}
    </FadeUp>
  );
};

export const Spread: React.FC<{ scene: SceneOf<"spread">; info: PageInfo }> = ({ scene, info }) => {
  const L = layoutFor(scene);
  const heroAt = 0.3;
  const printAt = (i: number) => 0.6 + i * 0.25;
  const linesAt = printAt(scene.prints.length) + 0.1;
  const lineAt = (i: number) => linesAt + i * 0.35;
  return (
    <Page info={info}>
      <Kicker text={scene.kicker} at={0.1} style={{ position: "absolute", top: safe.top + 20, left: safe.left }} />
      <Words
        text={scene.headline}
        at={0.3}
        size={type.headline}
        style={{ position: "absolute", top: safe.top + 80, left: safe.left, right: safe.right + 24 }}
      />
      {scene.sub ? (
        <FadeUp
          at={0.5}
          style={{
            position: "absolute",
            top: HEAD_BOTTOM - 10,
            left: safe.left,
            right: safe.right,
            fontFamily: serifItalic,
            fontStyle: "italic",
            fontSize: type.body,
            color: color.olive,
          }}
        >
          <Rich text={scene.sub} />
        </FadeUp>
      ) : null}

      <Hero photo={scene.photo} box={L.hero} at={heroAt} />
      {scene.prints.map((photo, i) => {
        const b = L.prints[i];
        return (
          <Print
            key={photo.src}
            photo={photo}
            at={printAt(i)}
            width={b.w}
            height={b.h}
            rotate={b.rotate}
            style={{ left: b.left, top: b.top }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          top: L.lines.top,
          left: L.lines.left,
          right: L.lines.right,
          display: "flex",
          flexDirection: "column",
          gap: 26,
          fontFamily: serif,
          fontSize: type.body,
          lineHeight: 1.2,
          color: color.ink,
        }}
      >
        {scene.lines.map((line, i) =>
          line.strike ? (
            <Struck key={line.text} text={line.text} note={line.note} at={lineAt(i)} />
          ) : (
            <FadeUp key={line.text} at={lineAt(i)}>
              <Rich text={line.text} />
              {line.note ? <span style={{ color: color.inkSoft }}> {line.note}</span> : null}
            </FadeUp>
          ),
        )}
      </div>
    </Page>
  );
};
