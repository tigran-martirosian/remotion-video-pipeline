import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Sequence } from "remotion";
import { SceneClock } from "../components/anim";
import { FilmGrain, Vignette } from "../components/FilmGrain";
import { LightLeak } from "../components/LightLeak";
import { SafeAreaOverlay } from "../components/SafeAreaOverlay";
import { SceneView } from "../scenes";
import { deckSlide } from "../transitions/deckSlide";
import { printStack } from "../transitions/printStack";
import { brand, color, VIDEO } from "../design/tokens";
import type { Topic } from "./schema";

const TRANSITION_FRAMES = { page: 22, stack: 20 } as const;
const LEAK_FRAMES = 34;

const sceneFrames = (sec: number) => Math.round(sec * VIDEO.fps);

// Start frame of each scene and total length, accounting for transition overlaps.
export { TRANSITION_FRAMES };
export const timeline = (topic: Topic) => {
  let t = 0;
  const starts = topic.scenes.map((scene, i) => {
    if (i > 0) t -= TRANSITION_FRAMES[scene.enter];
    const start = t;
    t += sceneFrames(scene.durationSec);
    return start;
  });
  return { starts, total: t };
};

// `probe` is for scripts/check.mjs only: "hideText" makes every glyph transparent, so the
// difference from a normal frame is exactly where text sits on screen.
export const TopicVideo: React.FC<{ topic: Topic; probe?: "hideText" }> = ({ topic, probe }) => {
  const { starts } = timeline(topic);
  const pages = topic.scenes.length;
  return (
    <AbsoluteFill style={{ backgroundColor: color.espresso }}>
      {probe === "hideText" ? (
        <style>{"*:not(.probe-keep) { color: transparent !important; text-shadow: none !important; }"}</style>
      ) : null}
      {/* Own stacking context, so transition z-indexes never cover the overlays below. */}
      <AbsoluteFill style={{ zIndex: 0 }}>
        <TransitionSeries>
          {topic.scenes.flatMap((scene, i) => {
            const info = { page: i + 1, pages, masthead: brand.masthead, ambient: scene.ambient };
            const seq = (
              <TransitionSeries.Sequence key={`s${i}`} durationInFrames={sceneFrames(scene.durationSec)}>
                <SceneClock.Provider value={{ leadFrames: i === 0 ? 0 : TRANSITION_FRAMES[scene.enter] }}>
                  <SceneView scene={scene} info={info} />
                </SceneClock.Provider>
              </TransitionSeries.Sequence>
            );
            if (i === 0) return [seq];
            return [
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={scene.enter === "page" ? deckSlide() : printStack()}
                timing={linearTiming({ durationInFrames: TRANSITION_FRAMES[scene.enter] })}
              />,
              seq,
            ];
          })}
        </TransitionSeries>
      </AbsoluteFill>
      {topic.scenes.map((scene, i) =>
        scene.leak && i > 0 ? (
          <Sequence key={`leak${i}`} from={starts[i] - 6} durationInFrames={LEAK_FRAMES} layout="none">
            <LightLeak durationInFrames={LEAK_FRAMES} flip={i % 2 === 0} />
          </Sequence>
        ) : null,
      )}
      <Vignette />
      <FilmGrain opacity={0.04} />
      {topic.showSafeArea ? <SafeAreaOverlay /> : null}
    </AbsoluteFill>
  );
};
