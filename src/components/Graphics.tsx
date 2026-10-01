import { useId } from "react";
import { interpolate, useVideoConfig } from "remotion";
import { dur, ease } from "../design/motion";
import { useEntrance, usePageFrame } from "./anim";

// A hand-drawn-looking stroke that draws itself from start to end.
export const DrawPath: React.FC<{
  d: string;
  at: number;
  length?: number;
  lengthSec?: number;
  stroke: string;
  width?: number;
  viewBox: string;
  style?: React.CSSProperties;
}> = ({ d, at, length = 1200, lengthSec = 0.7, stroke, width = 5, viewBox, style }) => {
  const p = useEntrance(at, lengthSec, ease.drift);
  return (
    <svg viewBox={viewBox} style={{ position: "absolute", overflow: "visible", ...style }}>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - p)}
      />
    </svg>
  );
};

// Counts every number in `value` at the same time, so a range like "7-9" stays a range while it
// counts: the first number starts at `from` and the others keep their distance to it.
export const useCount = (value: string, from: number, at: number, lengthSec = 1.4) => {
  const frame = usePageFrame();
  const { fps } = useVideoConfig();
  const numbers = [...value.matchAll(/\d+(?:\.\d+)?/g)];
  if (numbers.length === 0) return value;
  const first = Number(numbers[0][0]);
  const p = interpolate(frame, [at * fps, (at + lengthSec) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.settle,
  });
  if (p >= 1) return value;
  let i = 0;
  return value.replace(/\d+(?:\.\d+)?/g, (m) => {
    const target = Number(m);
    const start = from + (target - first) * (i++ === 0 ? 0 : 1);
    const decimals = m.includes(".") ? m.split(".")[1].length : 0;
    return (start + (target - start) * p).toFixed(decimals);
  });
};

// A value that simply appears: fades in and settles from 92% scale. No counting.
export const PopText: React.FC<{ value: string; at: number }> = ({ value, at }) => {
  const p = useEntrance(at, 0.7);
  return (
    <span style={{ display: "inline-block", opacity: p, transform: `scale(${0.92 + 0.08 * p})`, transformOrigin: "0% 70%" }}>
      {value}
    </span>
  );
};

export const CountText: React.FC<{ value: string; from: number; at: number; lengthSec?: number }> = ({
  value,
  from,
  at,
  lengthSec = dur.imageIn,
}) => <>{useCount(value, from, at, lengthSec)}</>;

// Unique ids for SVG defs, so two mounted pages (during a transition) never collide.
export const useSvgId = (name: string) => `${name}-${useId().replace(/:/g, "")}`;
