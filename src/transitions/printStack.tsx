import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, interpolate } from "remotion";
import { ease } from "../design/motion";

type Props = Record<string, never>;

// The next page slides up over the current one like a print laid on a stack.
const PrintStack: React.FC<TransitionPresentationComponentProps<Props>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const p = ease.settle(presentationProgress);
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill style={{ transform: `scale(${interpolate(p, [0, 1], [1, 0.94])})` }}>
        {children}
        <AbsoluteFill style={{ background: `rgba(46,34,25,${0.45 * p})`, pointerEvents: "none" }} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{
        zIndex: 2,
        transform: `translateY(${(1 - p) * 100}%) rotate(${(1 - p) * 3}deg)`,
        transformOrigin: "50% 0%",
        boxShadow: `0 -30px 70px rgba(46,34,25,${0.4 * (1 - p * 0.7)})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const printStack = (): TransitionPresentation<Props> => ({ component: PrintStack, props: {} });
