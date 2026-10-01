import { AbsoluteFill } from "remotion";

// Fine, still paper grain over everything (animated grain read as "floating specks").
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.1 }) => {
  const id = "grain";
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

// A soft vignette so edges feel like a printed, photographed page.
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(120% 90% at 50% 45%, rgba(46,34,25,0) 60%, rgba(46,34,25,0.12) 100%)",
    }}
  />
);
