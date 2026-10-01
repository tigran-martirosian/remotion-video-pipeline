import { loadFont as loadSerif } from "@remotion/google-fonts/EBGaramond";
import { loadFont as loadSans } from "@remotion/google-fonts/Jost";

// Editorial serif for headlines and body (editorial magazine feel),
// geometric sans for mastheads (light, lowercase), labels, numbers and measurements.
export const serif = loadSerif("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
}).fontFamily;

export const serifItalic = loadSerif("italic", {
  weights: ["400"],
  subsets: ["latin"],
}).fontFamily;

export const sans = loadSans("normal", {
  weights: ["300", "400", "500", "600"],
  subsets: ["latin"],
}).fontFamily;
