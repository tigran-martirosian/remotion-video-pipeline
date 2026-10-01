import { Composition } from "remotion";
import { z } from "zod";
import { VIDEO } from "./design/tokens";
import { topics } from "./topics";
import { topicSchema } from "./video/schema";
import { timeline, TopicVideo } from "./video/TopicVideo";

// One composition per topic config; the topic itself is the editable prop in Studio.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {topics.map((topic) => (
        <Composition
          key={topic.slug}
          id={topic.slug}
          component={TopicVideo}
          schema={z.object({
            topic: topicSchema,
            probe: z.enum(["hideText"]).optional(),
          })}
          durationInFrames={timeline(topic).total}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
          defaultProps={{ topic }}
        />
      ))}
    </>
  );
};
