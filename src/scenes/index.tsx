import type { Scene } from "../video/schema";
import type { PageInfo } from "./common";
import { Bars } from "./Bars";
import { Cover } from "./Cover";
import { Next } from "./Next";
import { Spread } from "./Spread";
import { Stat } from "./Stat";
import { Steps } from "./Steps";
import { Takeaway } from "./Takeaway";
import { Timeline } from "./Timeline";

// One template per scene type.
export const SceneView: React.FC<{ scene: Scene; info: PageInfo }> = ({ scene, info }) => {
  switch (scene.type) {
    case "cover":
      return <Cover scene={scene} info={info} />;
    case "next":
      return <Next scene={scene} info={info} />;
    case "timeline":
      return <Timeline scene={scene} info={info} />;
    case "stat":
      return <Stat scene={scene} info={info} />;
    case "takeaway":
      return <Takeaway scene={scene} info={info} />;
    case "spread":
      return <Spread scene={scene} info={info} />;
    case "steps":
      return <Steps scene={scene} info={info} />;
    case "bars":
      return <Bars scene={scene} info={info} />;
  }
};
