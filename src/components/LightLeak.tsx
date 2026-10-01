import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ease } from "../design/motion";

// Warm light leak that blooms and fades over its own Sequence. Screen-blended, no WebGL.
export const LightLeak: React.FC<{ durationInFrames: number; flip?: boolean }> = ({
  durationInFrames,
  flip = false,
}) => {
  const frame = useCurrentFrame();
  const t = frame / durationInFrames;
  const opacity = interpolate(t, [0, 0.35, 1], [0, 1, 0], { easing: ease.drift });
  const travel = interpolate(t, [0, 1], [-18, 22]);
  const side = flip ? 100 - travel : travel;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(55% 40% at ${side}% 30%, rgba(255, 186, 110, 1) 0%, rgba(255, 150, 70, 0.55) 45%, rgba(255, 120, 50, 0) 75%),
            radial-gradient(35% 60% at ${side + 25}% 75%, rgba(255, 214, 150, 0.55) 0%, rgba(255, 214, 150, 0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};
