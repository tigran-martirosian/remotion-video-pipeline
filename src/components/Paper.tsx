import { AbsoluteFill, Img, staticFile } from "remotion";
import { color } from "../design/tokens";
import type { Photo } from "../video/schema";
import { useSvgId } from "./Graphics";

// A sunlit page: airy mist paper, soft window light, faint fibre, and optionally a heavily
// blurred photo (soft light) behind everything. All still.
// Opaque on purpose: pages must hide what is underneath during a page turn.
export const Paper: React.FC<{ tone?: "mist" | "cream" | "paper"; ambient?: Photo }> = ({
  tone = "mist",
  ambient,
}) => {
  const fibre = useSvgId("paper-fibre");
  return (
    <AbsoluteFill style={{ backgroundColor: color[tone] }}>
      {ambient ? (
        <Img
          src={staticFile(ambient.src)}
          style={{
            position: "absolute",
            inset: -120,
            width: "calc(100% + 240px)",
            height: "calc(100% + 240px)",
            objectFit: "cover",
            objectPosition: ambient.focus ?? "50% 50%",
            filter: "blur(60px) saturate(0.6) brightness(1.4) contrast(0.7)",
            opacity: 0.19,
          }}
        />
      ) : null}
      {/* Mist settles over the lower page so dark shapes in the ambient photo never show. */}
      {ambient ? (
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, rgba(248,244,236,0) 45%, ${color[tone]} 88%)`,
          }}
        />
      ) : null}
      {/* Window light from the top-left, a warm settle bottom-right. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(110% 65% at 15% 5%, rgba(255, 252, 244, 0.85) 0%, rgba(255, 252, 244, 0) 62%),
            radial-gradient(90% 60% at 100% 100%, rgba(217, 183, 126, 0.14) 0%, rgba(217, 183, 126, 0) 70%)`,
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.14, mixBlendMode: "multiply" }}>
        <filter id={fibre}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves={2} seed={4} />
          <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.32  0 0 0 0 0.22  0 0 0 0.35 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${fibre})`} />
      </svg>
    </AbsoluteFill>
  );
};
