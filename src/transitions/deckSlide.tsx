import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ease } from "../design/motion";

type Props = Record<string, never>;

// A deck of cards: the top card slides up and off, revealing the next card underneath,
// which settles up into place from slightly lower in the deck.
const DeckSlide: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress,
  presentationDurationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = ease.drift(presentationProgress);
  if (presentationDirection === "entering") {
    // Underneath: shaded by the card above, lifting slightly into place as it clears.
    const shade = interpolate(p, [0, 1], [0.16, 0]);
    const scale = interpolate(p, [0, 1], [0.97, 1]);
    return (
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        {children}
        <AbsoluteFill style={{ background: `rgba(46,34,25,${shade})`, pointerEvents: "none" }} />
      </AbsoluteFill>
    );
  }
  // TransitionSeries wraps a middle page in BOTH its exit and its entrance presentation, so
  // an incoming page carries an idle exit wrapper too. Only the page that is really leaving
  // (its last frames) may sit on top, or the incoming page would cover it.
  const leaving = frame >= durationInFrames - presentationDurationInFrames;
  const y = interpolate(p, [0, 1], [0, -104]);
  return (
    <AbsoluteFill style={{ zIndex: leaving ? 10 : 0 }}>
      <AbsoluteFill
        style={{
          transform: `translateY(${y}%)`,
          // The card's lower edge casts a soft shadow onto the card underneath.
          boxShadow: `0 ${30 * p}px ${80 * p}px rgba(46,34,25,${0.28 * Math.min(1, p * 3)})`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const deckSlide = (): TransitionPresentation<Props> => ({ component: DeckSlide, props: {} });
