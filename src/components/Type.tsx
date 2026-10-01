import { Fragment } from "react";
import { interpolate, useVideoConfig } from "remotion";
import { serif, serifItalic } from "../design/fonts";
import { dur, ease } from "../design/motion";
import { color, type } from "../design/tokens";
import { parseEmphasis, useEntrance, usePageFrame } from "./anim";

type EmColor = "olive" | "terracotta" | "inherit";

// Unicode fraction glyphs (⅓, ½…) are drawn tiny in EB Garamond; render them larger.
const FRACTION = /([¼½¾⅓⅔⅛])/;
export const Fractions: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(FRACTION).map((part, i) =>
      FRACTION.test(part) ? (
        <span
          key={i}
          style={{
            fontSize: "1.45em",
            lineHeight: 0,
            verticalAlign: "-0.06em",
          }}
        >
          {part}
        </span>
      ) : (
        part
      ),
    )}
  </>
);

// Headline that rises word by word out of a mask. `*word*` renders in serif italic.
export const Words: React.FC<{
  text: string;
  at: number;
  size?: number;
  emColor?: EmColor;
  style?: React.CSSProperties;
  stagger?: number;
}> = ({
  text,
  at,
  size = type.headline,
  emColor = "olive",
  style,
  stagger = dur.textStagger * 0.5,
}) => {
  const frame = usePageFrame();
  const { fps } = useVideoConfig();
  const words = parseEmphasis(text).flatMap((run) =>
    run.text
      .split(/(\s+)/)
      .filter((w) => w.length > 0)
      .map((w) => ({ w, em: run.em })),
  );
  const groups: { w: string; em: boolean }[][] = [[]];
  for (const token of words) {
    if (/^\s+$/.test(token.w)) groups.push([]);
    else groups[groups.length - 1].push(token);
  }
  let i = 0;
  return (
    <div
      style={{
        fontFamily: serif,
        fontSize: size,
        lineHeight: 1.06,
        letterSpacing: "-0.01em",
        color: color.ink,
        ...style,
      }}
    >
      {groups.map((group, g) => (
        // A word and the punctuation touching it (e.g. an italic word + ".") never split.
        <Fragment key={g}>
          {g > 0 ? " " : null}
          <span style={{ whiteSpace: "nowrap" }}>
            {group.map(({ w, em }, k) => {
              const start = (at + i * stagger) * fps;
              i++;
              const p = interpolate(
                frame,
                [start, start + dur.textIn * fps],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: ease.settle,
                },
              );
              return (
                <span
                  key={k}
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    verticalAlign: "top",
                    paddingBottom: "0.26em",
                    marginBottom: "-0.18em",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transform: `translateY(${(1 - p) * 105}%)`,
                      // Hidden until it starts rising: tall ascenders would otherwise peek over the mask.
                      opacity: p > 0 ? 1 : 0,
                      fontFamily: em ? serifItalic : undefined,
                      fontStyle: em ? "italic" : undefined,
                      color:
                        em && emColor !== "inherit"
                          ? color[emColor]
                          : undefined,
                    }}
                  >
                    <Fractions text={w} />
                  </span>
                </span>
              );
            })}
          </span>
        </Fragment>
      ))}
    </div>
  );
};

// A line or block that fades in with a small rise. Supports *emphasis* in string children.
export const FadeUp: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  rise?: number;
}> = ({ at, children, style, rise = 18 }) => {
  const p = useEntrance(at);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * rise}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Inline rendering of *emphasis* for body copy.
export const Rich: React.FC<{ text: string; emColor?: EmColor }> = ({
  text,
  emColor = "olive",
}) => (
  <>
    {parseEmphasis(text).map((run, k) =>
      run.em ? (
        <span
          key={k}
          style={{
            fontFamily: serifItalic,
            fontStyle: "italic",
            color: emColor === "inherit" ? undefined : color[emColor],
          }}
        >
          <Fractions text={run.text} />
        </span>
      ) : (
        <span key={k}>
          <Fractions text={run.text} />
        </span>
      ),
    )}
  </>
);

// Soft upright line above a headline, e.g. "right before drinking". No rules, no caps.
export const Kicker: React.FC<{
  text: string;
  at: number;
  tone?: string;
  style?: React.CSSProperties;
}> = ({ text, at, tone = color.olive, style }) => {
  const p = useEntrance(at);
  return (
    <div
      style={{
        fontFamily: serif,
        fontSize: type.kicker,
        letterSpacing: "0.01em",
        color: tone,
        opacity: p,
        transform: `translateY(${(1 - p) * 10}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
