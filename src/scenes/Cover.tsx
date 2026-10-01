import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useEntrance } from "../components/anim";
import { DrawPath } from "../components/Graphics";
import { Photo } from "../components/Photo";
import { Print } from "../components/Print";
import { FadeUp, Words } from "../components/Type";
import { serif } from "../design/fonts";
import { ease } from "../design/motion";
import { color, safe } from "../design/tokens";
import type { SceneOf } from "../video/schema";
import { Page, type PageInfo } from "./common";

// The window the photo sits in: an arch, like a sunlit window.
const ARCH = { left: 110, top: 580, w: 860, h: 1360 };
// Small prints laid over the lower edge of the window, left to right.
const PRINTS = [
  { left: 56, top: 1330, rotate: -4 },
  { left: 392, top: 1390, rotate: 2 },
  { left: 724, top: 1320, rotate: -2.5 },
];
const PRINT = { w: 300, h: 370 };

// A four-point glint of light that blooms and turns slowly.
const Glint: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = useEntrance(at, 0.8);
  const pulse = 0.85 + Math.sin((frame / fps) * 2.4) * 0.15;
  return (
    <svg
      viewBox="-50 -50 100 100"
      style={{
        position: "absolute",
        left: x - 60,
        top: y - 60,
        width: 120,
        height: 120,
        transform: `rotate(${(frame / fps) * 12}deg) scale(${p * pulse})`,
        filter: "drop-shadow(0 0 10px rgba(255,255,240,0.95))",
        mixBlendMode: "screen",
      }}
    >
      <path d="M 0 -48 C 4 -8, 8 -4, 48 0 C 8 4, 4 8, 0 48 C -4 8, -8 4, -48 0 C -8 -4, -4 -8, 0 -48 Z" fill="#FFFDF4" />
    </svg>
  );
};

export const Cover: React.FC<{ scene: SceneOf<"cover">; info: PageInfo }> = ({ scene, info }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const open = useEntrance(0, 1.4, ease.settle);
  // A soft beam of window light sweeping slowly across the photo (only with a glint).
  const beam = interpolate(frame, [0, durationInFrames], [-40, 120]);
  const round = `${ARCH.w / 2}px ${ARCH.w / 2}px 18px 18px`;
  return (
    <Page info={info}>
      {scene.eyebrow ? (
        <FadeUp
          at={-0.6}
          style={{
            position: "absolute",
            top: safe.top + 10,
            left: safe.left,
            fontFamily: serif,
            fontSize: 64,
            color: color.olive,
          }}
        >
          {scene.eyebrow}
        </FadeUp>
      ) : null}
      <Words
        text={scene.headline}
        at={-0.45}
        size={156}
        emColor="olive"
        stagger={0.12}
        style={{ position: "absolute", top: safe.top + 86, left: safe.left - 6, right: safe.right - 60, lineHeight: 0.98 }}
      />

      {/* Window frame line, drawn around the arch a little way out */}
      <DrawPath
        viewBox={`0 0 ${ARCH.w + 80} ${ARCH.h + 80}`}
        d={`M 40 ${ARCH.h + 40} L 40 ${ARCH.w / 2 + 20} A ${ARCH.w / 2 + 20} ${ARCH.w / 2 + 20} 0 0 1 ${ARCH.w + 40} ${ARCH.w / 2 + 20} L ${ARCH.w + 40} ${ARCH.h + 40}`}
        at={0.5}
        lengthSec={1.6}
        length={3400}
        stroke={color.walnut}
        width={2}
        style={{ left: ARCH.left - 40, top: ARCH.top - 40, width: ARCH.w + 80, height: ARCH.h + 80, opacity: 0.5 }}
      />

      <div
        style={{
          position: "absolute",
          left: ARCH.left,
          top: ARCH.top,
          width: ARCH.w,
          height: ARCH.h,
          borderRadius: round,
          overflow: "hidden",
          opacity: 0.45 + 0.55 * open,
          transform: `scale(${0.95 + 0.05 * open})`,
          transformOrigin: "50% 100%",
          boxShadow: "0 30px 60px rgba(46,34,25,0.16)",
        }}
      >
        <Photo photo={scene.photo} style={{ width: "100%", height: "100%" }} />
        {/* Light effects only when the photo has something to catch the light (a highlight). */}
        {scene.glint ? (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                mixBlendMode: "screen",
                background: `linear-gradient(115deg, rgba(255,250,235,0) ${beam - 20}%, rgba(255,250,235,0.42) ${beam}%, rgba(255,250,235,0) ${beam + 18}%)`,
              }}
            />
            <Glint x={(scene.glint.x / 100) * ARCH.w} y={(scene.glint.y / 100) * ARCH.h} at={1.2} />
          </>
        ) : null}
      </div>
      {scene.prints.map((photo, i) => (
        <Print
          key={photo.src}
          photo={photo}
          at={0.6 + i * 0.25}
          width={PRINT.w}
          height={PRINT.h}
          rotate={PRINTS[i].rotate}
          style={{ left: PRINTS[i].left, top: PRINTS[i].top }}
        />
      ))}
    </Page>
  );
};
