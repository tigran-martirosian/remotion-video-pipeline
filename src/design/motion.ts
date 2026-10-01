import { Easing } from "remotion";

// Calm motion vocabulary. Everything eases out slowly; nothing bounces or snaps.
export const ease = {
  // Default for text and image entrances.
  settle: Easing.bezier(0.22, 1, 0.36, 1),
  // Symmetric, for crossfades and slow drifts.
  drift: Easing.bezier(0.45, 0, 0.55, 1),
  // Exits: quick to start, soft landing.
  leave: Easing.bezier(0.5, 0, 0.75, 0),
} as const;

// Durations in seconds; multiply by fps at the call site.
export const dur = {
  textIn: 0.9,
  textStagger: 0.18,
  imageIn: 1.4,
  crossfade: 0.7,
  minHold: 2.2,
} as const;

// Ken Burns / parallax ranges across a whole scene. Keep them small.
export const drift = {
  photoScale: [1.04, 1.1],
  photoTranslatePx: 36,
  foregroundTranslatePx: 70,
} as const;
