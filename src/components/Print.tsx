import { interpolate, useVideoConfig } from "remotion";
import { ease } from "../design/motion";
import { color } from "../design/tokens";
import type { Photo as PhotoData } from "../video/schema";
import { usePageFrame } from "./anim";
import { Photo } from "./Photo";

// A photographic print with a cream border that drops onto the page and settles at `rotate`.
export const Print: React.FC<{
  photo: PhotoData;
  at: number;
  width: number;
  height: number;
  rotate?: number;
  caption?: string;
  // Vertical offset the print travels from (negative = drops from above).
  from?: number;
  // How long the entrance takes (seconds).
  lengthSec?: number;
  style?: React.CSSProperties;
}> = ({ photo, at, width, height, rotate = -2, caption, from = -90, lengthSec = 1.0, style }) => {
  const frame = usePageFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [at * fps, (at + lengthSec) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.settle,
  });
  const border = Math.round(width * 0.045);
  return (
    <div
      style={{
        position: "absolute",
        width,
        padding: border,
        paddingBottom: caption ? border * 3.2 : border,
        background: color.printBorder,
        boxShadow: `0 ${18 * p}px ${40 * p}px rgba(46,34,25,${0.28 * p}), 0 2px 4px rgba(46,34,25,0.12)`,
        opacity: interpolate(p, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${(1 - p) * from}px) rotate(${rotate + (1 - p) * rotate * 2.2}deg) scale(${1.08 - 0.08 * p})`,
        ...style,
      }}
    >
      <Photo photo={photo} style={{ width: width - border * 2, height: height - border * 2 }} />
      {caption ? (
        <div
          style={{
            position: "absolute",
            left: border,
            bottom: border * 0.9,
            fontFamily: "inherit",
            fontSize: 30,
            color: color.inkSoft,
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};

// A circular photo chip for diagrams; scales up from 0.85 as it fades in.
export const Chip: React.FC<{ photo: PhotoData; at: number; size: number; ring?: string }> = ({
  photo,
  at,
  size,
  ring = color.cream,
}) => {
  const frame = usePageFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [at * fps, (at + 0.8) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease.settle,
  });
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: `6px solid ${ring}`,
        boxShadow: "0 8px 20px rgba(46,34,25,0.22)",
        opacity: p,
        transform: `scale(${0.85 + 0.15 * p})`,
        flexShrink: 0,
      }}
    >
      <Photo photo={photo} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
