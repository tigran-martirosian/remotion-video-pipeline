import { createContext, useContext } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { dur, ease } from "../design/motion";

// Scenes are authored in "page time": 0 = the moment the page is fully in view, i.e. after
// the `leadFrames` of the page turn that brings it in. Entrances start at page time ≥ 0, so
// nothing is already on the page while it turns in (DECISIONS.md: nothing pre-rolled).
export const SceneClock = createContext({ leadFrames: 0 });

export const usePageFrame = () => useCurrentFrame() - useContext(SceneClock).leadFrames;

// Progress from 0 to 1 of an entrance that starts at `at` seconds of page time.
export const useEntrance = (at: number, lengthSec: number = dur.textIn, easing = ease.settle) => {
  const frame = usePageFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame, [at * fps, (at + lengthSec) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
};

// Same as useEntrance but as a plain function, for use inside loops.
export const progress = (
  frame: number,
  fps: number,
  at: number,
  lengthSec: number = dur.textIn,
  easing = ease.settle,
) =>
  interpolate(frame, [at * fps, (at + lengthSec) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

// Split copy on *asterisks* into plain and emphasised runs.
export const parseEmphasis = (text: string): { text: string; em: boolean }[] =>
  text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("*") && part.endsWith("*")
        ? { text: part.slice(1, -1), em: true }
        : { text: part, em: false },
    );
