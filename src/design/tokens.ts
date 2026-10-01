// Single source of truth for the visual language. Change the look here, not in scenes.

// The name shown as the masthead and in every folio.
export const brand = {
  masthead: "explainer.demo",
} as const;

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

// Warm editorial palette: cream paper, walnut brown, olive and terracotta accents.
// Keep saturation low; imagery supplies the colour.
export const color = {
  cream: "#F3EBDD",
  // Airy page tone: lighter than cream, faintly warm.
  mist: "#F8F4EC",
  paper: "#EAE0CC",
  linen: "#DCCFB6",
  walnut: "#6B4A33",
  espresso: "#2E2219",
  olive: "#6E6A3C",
  terracotta: "#A9623F",
  // Border of photographic prints: a touch lighter and warmer than the page.
  printBorder: "#F8F2E6",
  // Series colours for the proportion bars.
  seriesA: "#AEBB6E",
  seriesB: "#D3D9AE",
  seriesC: "#D98E52",
  seriesD: "#5F7A3A",
  water: "#DCE3DA",
  ink: "#2E2219",
  inkSoft: "rgba(46, 34, 25, 0.72)",
  inkFaint: "rgba(46, 34, 25, 0.38)",
} as const;

// Type sizes for a 1080px-wide frame. Headline minimum is 84px; supporting text 44px.
export const type = {
  display: 150,
  headline: 116,
  title: 80,
  body: 54,
  // Small line above headlines (upright serif: the italic "h" reads as a "b").
  kicker: 48,
  // Labels under/next to photos and chips.
  caption: 46,
  // Big counted numbers (temperature, days).
  stat: 220,
  label: 38,
  micro: 28,
  lineHeightTight: 1.02,
  lineHeightBody: 1.28,
  trackingLabel: "0.14em",
} as const;

export const space = {
  xs: 12,
  sm: 24,
  md: 40,
  lg: 64,
  xl: 104,
} as const;

// Areas covered by TikTok's UI on a 1080x1920 frame: top bar ~130 to 150px, name/caption/sound
// ~320 to 480px at the bottom, the button column ~140 to 165px on the right (2026 guides).
// Keep all essential text inside the safe rectangle.
export const safe = {
  top: 160,
  bottom: 430,
  left: 70,
  right: 150,
} as const;
