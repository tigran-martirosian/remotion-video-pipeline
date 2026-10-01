import type { TopicInput } from "../video/schema";

// Demo video: how a binary search works. All images are SVGs generated for this repo
// (public/demo/); the copy is written for the demo and is not taken from anywhere else.
const art = {
  hero: { src: "demo/hero.svg", focus: "50% 45%" },
  array: { src: "demo/array.svg" },
  halve: { src: "demo/halve.svg" },
  found: { src: "demo/found.svg" },
  growth: { src: "demo/growth.svg", focus: "50% 70%" },
};

export const binarySearch: TopicInput = {
  slug: "binary-search",
  title: "How a binary search works",
  scenes: [
    {
      type: "cover",
      durationSec: 4,
      eyebrow: "a quick explainer",
      headline: "Binary *search*",
      photo: art.hero,
      glint: { x: 50, y: 40 },
      source: "Demo content",
    },
    {
      type: "steps",
      durationSec: 6,
      enter: "page",
      kicker: "on a sorted list",
      headline: "Halve it, repeat",
      steps: [
        { label: "Compare", photo: art.array },
        { label: "Drop half", photo: art.halve },
        { label: "Repeat", photo: art.found },
      ],
      note: "Each step throws away half of what is left.",
      source: "Demo content",
    },
    {
      type: "stat",
      durationSec: 6,
      enter: "stack",
      layout: "stack",
      kicker: "one million items",
      stat: { value: "20", countFrom: 0, unit: "steps" },
      lines: ["at most, to find any one item", "because 2^20 is just over a million"],
      photo: art.growth,
      source: "Demo content",
    },
    {
      type: "bars",
      durationSec: 6,
      enter: "page",
      kicker: "worst case, 1,000,000 items",
      headline: "Steps needed",
      rows: [
        {
          title: "Linear scan",
          parts: [{ label: "1,000,000", share: 1, color: "seriesC" }],
        },
        {
          title: "Binary search",
          parts: [{ label: "20", share: 0.05, color: "seriesD" }],
          note: "Needs the list to be sorted first.",
        },
      ],
      source: "Demo content",
    },
    {
      type: "takeaway",
      durationSec: 4.5,
      enter: "page",
      kicker: "the short version",
      lines: ["Sorted data only", "Check the middle", "Halve the range"],
      photos: [art.found],
      source: "Demo content",
    },
  ],
};
