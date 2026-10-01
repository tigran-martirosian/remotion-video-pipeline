import { Img, staticFile } from "remotion";
import type { Photo as PhotoData } from "../video/schema";

// Soft and sunlit: a touch warm, lifted, gently low-contrast.
const GRADE = "sepia(0.1) saturate(0.9) contrast(0.9) brightness(1.06)";
const GRADE_WARM = "sepia(0.26) saturate(0.82) contrast(0.86) brightness(1.12)";

// A graded photo that fills its box (object-fit: cover). Deliberately still: slow
// zooms/pans get snapped to whole pixels by the renderer and read as trembling.
export const Photo: React.FC<{ photo: PhotoData; style?: React.CSSProperties }> = ({ photo, style }) => {
  const layer: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: photo.focus ?? "50% 50%",
    transform: photo.zoom ? `scale(${photo.zoom})` : undefined,
    transformOrigin: photo.focus ?? "50% 50%",
  };
  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }}>
      <Img src={staticFile(photo.src)} style={{ ...layer, filter: photo.tone === "warm" ? GRADE_WARM : GRADE }} />
      {/* Glow: a blurred, brightened copy screened on top, for the soft "sunlit" bloom. */}
      <Img
        src={staticFile(photo.src)}
        style={{ ...layer, filter: "blur(22px) brightness(1.15) saturate(0.8)", mixBlendMode: "screen", opacity: 0.3 }}
      />
      {/* Warm multiply wash ties every source to the palette. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, rgba(217,183,126,0.14), rgba(107,74,51,0.08))",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
};
