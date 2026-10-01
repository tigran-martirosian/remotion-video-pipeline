import { Chip } from "../components/Print";
import { CountText, DrawPath } from "../components/Graphics";
import { FadeUp, Fractions, Kicker, Rich, Words } from "../components/Type";
import { serif, serifItalic } from "../design/fonts";
import { color, safe, type } from "../design/tokens";
import type { SceneOf } from "../video/schema";
import { Page, type PageInfo } from "./common";

const CHIP = 128;
// Row pitch = chip + its label + clear air, so a label never touches the next row's chip.
const ROW = { top: 540, height: 228, noteExtra: 56 };
// Keep 20px clear of TikTok's right-hand button column (and its labels).
const RIGHT_EDGE = 1080 - safe.right - 20;
const LINE = { from: safe.left + 20 + CHIP + 24, to: RIGHT_EDGE - CHIP - 24 };

const ChipLabel: React.FC<{ text: string; at: number }> = ({ text, at }) => (
  <FadeUp
    at={at}
    rise={8}
    style={{
      width: CHIP + 20,
      marginLeft: -10,
      textAlign: "center",
      marginTop: 8,
      fontFamily: serifItalic,
      fontStyle: "italic",
      fontSize: type.caption,
      lineHeight: 1,
      color: color.inkSoft,
    }}
  >
    {text}
  </FadeUp>
);

export const Timeline: React.FC<{ scene: SceneOf<"timeline">; info: PageInfo }> = ({ scene, info }) => {
  let top = ROW.top;
  const rows = scene.rows.map((row, i) => {
    const rowTop = top;
    // A two-line note under a row gets extra room so it never crowds the next row.
    top += ROW.height + (row.note && row.note.length > 24 ? ROW.noteExtra : 0);
    return { row, rowTop, at: 1.0 + i * 1.1 };
  });
  const len = LINE.to - LINE.from;
  return (
    <Page info={info}>
      <Kicker text={scene.kicker} at={0.1} style={{ position: "absolute", top: safe.top + 20, left: safe.left }} />
      <Words
        text={scene.headline}
        at={0.5}
        size={type.headline}
        emColor="olive"
        style={{ position: "absolute", top: safe.top + 80, left: safe.left, right: safe.right }}
      />
      {scene.sub ? (
        <FadeUp
          at={1.1}
          style={{
            position: "absolute",
            top: safe.top + 214,
            left: safe.left,
            right: safe.right,
            fontFamily: serif,
            fontSize: type.body,
            lineHeight: 1.15,
            color: color.inkSoft,
          }}
        >
          <Rich text={scene.sub} />
        </FadeUp>
      ) : null}

      {rows.map(({ row, rowTop, at }) => {
        const mid = CHIP / 2;
        const arrow = (x: number, dir: 1 | -1) => `M ${x - dir * 16} ${mid - 11} L ${x} ${mid} L ${x - dir * 16} ${mid + 11}`;
        return (
          <div key={row.from.label + row.to.label} style={{ position: "absolute", left: 0, right: 0, top: rowTop }}>
            <div style={{ position: "absolute", left: safe.left + 20 }}>
              <Chip photo={row.from.photo} at={at} size={CHIP} />
              <ChipLabel text={row.from.label} at={at + 0.2} />
            </div>
            <div style={{ position: "absolute", left: LINE.to + 24 }}>
              <Chip photo={row.to.photo} at={at + 0.55} size={CHIP} />
              <ChipLabel text={row.to.label} at={at + 0.75} />
            </div>
            <DrawPath
              viewBox={`0 0 ${len} ${CHIP}`}
              d={`M 0 ${mid} L ${len} ${mid} ${arrow(len, 1)} ${row.twoWay ? arrow(0, -1) : ""}`}
              at={at + 0.25}
              lengthSec={0.6}
              length={len + 200}
              stroke={color.walnut}
              width={3}
              style={{ left: LINE.from, top: 0, width: len, height: CHIP }}
            />
            <FadeUp
              at={at + 0.45}
              rise={10}
              style={{
                position: "absolute",
                left: LINE.from,
                width: len,
                // Sit on the line: the text box ends 14px above it (descenders included).
                top: mid - type.title - 14,
                lineHeight: 1,
                textAlign: "center",
                fontFamily: serif,
                fontSize: type.title,
                color: color.ink,
              }}
            >
              {/* Only count values big enough to read as counting (30, 15); "1 hour" just lands. */}
              {parseFloat(row.time) >= 10 ? (
                <CountText value={row.time} from={0} at={at + 0.45} lengthSec={0.7} />
              ) : (
                <Fractions text={row.time} />
              )}
            </FadeUp>
            {row.note ? (
              <FadeUp
                at={at + 1.0}
                style={{
                  position: "absolute",
                  left: LINE.from,
                  width: len,
                  top: mid + 14,
                  textAlign: "center",
                  lineHeight: 1.05,
                  fontFamily: serifItalic,
                  fontStyle: "italic",
                  fontSize: type.caption,
                  color: color.terracotta,
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
