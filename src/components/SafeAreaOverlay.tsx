import { AbsoluteFill } from "remotion";
import { safe } from "../design/tokens";

// Design aid only: shades the regions TikTok / Reels UI covers. Never enabled in final renders.
export const SafeAreaOverlay: React.FC = () => {
  const shade = "rgba(169, 98, 63, 0.22)";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: safe.top, background: shade }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: safe.bottom, background: shade }} />
      <div style={{ position: "absolute", top: safe.top, bottom: safe.bottom, left: 0, width: safe.left, background: shade }} />
      <div style={{ position: "absolute", top: safe.top, bottom: safe.bottom, right: 0, width: safe.right, background: shade }} />
      <div
        style={{
          position: "absolute",
          top: safe.top,
          bottom: safe.bottom,
          left: safe.left,
          right: safe.right,
          outline: "2px dashed rgba(169, 98, 63, 0.8)",
        }}
      />
    </AbsoluteFill>
  );
};
