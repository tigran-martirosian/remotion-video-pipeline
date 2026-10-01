import { z } from "zod";

// A topic video is a deck of scenes you flip through. Each scene type maps to one
// reusable template in src/scenes/. Copy and image choices live in src/topics/<slug>.ts,
// never inside scene components.
//
// Copy strings may mark one emphasised word or phrase with *asterisks*; templates render it
// in serif italic.

// A photo is a path relative to public/ plus optional framing for object-fit: cover.
const photo = z.object({
  src: z.string().describe('Relative to public/, e.g. "demo/hero.svg"'),
  // CSS object-position, e.g. "50% 70%" to keep a subject in the lower part of the frame.
  focus: z.string().optional(),
  // Extra crop-in around `focus` (1 = none), for tightening on a subject in a wide source.
  zoom: z.number().min(1).optional(),
  // Extra warming for cool sources so they sit with the cream pages.
  tone: z.enum(["warm"]).optional(),
});

// Where the copy comes from, so every on-screen fact is traceable.
const source = z.string().describe("Reference the copy is taken from");

const base = {
  durationSec: z.number().min(2),
  // How this page arrives. Ignored on the first scene.
  enter: z.enum(["page", "stack"]).default("page"),
  // Warm light leak riding on the cut into this page.
  leak: z.boolean().default(false),
  // Blurred photo behind the page (soft light, texture).
  ambient: photo.optional(),
  source,
};

// The cover: title above a window-shaped photo, a glint of light.
export const coverScene = z.object({
  type: z.literal("cover"),
  eyebrow: z.string().optional(),
  headline: z.string(),
  photo,
  // Where the glint sparkles, in % of the window photo (e.g. a highlight on the subject).
  glint: z.object({ x: z.number(), y: z.number() }).optional(),
  // Small prints of related items dropped over the lower edge of the window photo.
  prints: z.array(photo).max(3).default([]),
  ...base,
});

// Rows of [chip] "line" [chip] with a time on the line.
export const timelineScene = z.object({
  type: z.literal("timeline"),
  kicker: z.string(),
  headline: z.string(),
  sub: z.string().optional(),
  rows: z
    .array(
      z.object({
        from: z.object({ label: z.string(), photo }),
        to: z.object({ label: z.string(), photo }),
        time: z.string(),
        twoWay: z.boolean().default(false),
        note: z.string().optional(),
      }),
    )
    .min(1)
    .max(4),
  ...base,
});

// One big counted number with lines, and a photo band (stack) or side photo (split).
export const statScene = z.object({
  type: z.literal("stat"),
  layout: z.enum(["stack", "split"]),
  kicker: z.string(),
  stat: z.object({
    // Every number in `value` counts; the first starts at `countFrom`.
    value: z.string(),
    countFrom: z.number(),
    unit: z.string().optional(),
  }),
  lines: z.array(z.string()).min(1).max(3),
  photo,
  prints: z.array(photo).max(2).default([]),
  ...base,
});

// The closing card: a soft full-bleed photo and what comes next.
export const nextScene = z.object({
  type: z.literal("next"),
  kicker: z.string(),
  headline: z.string(),
  photo,
  // A loose spread of prints above the title (e.g. items the next video covers).
  prints: z.array(photo).max(5).default([]),
  ...base,
});

// A line of copy on content pages. `strike` draws a hand-drawn line through `text`; `note`
// follows it unstruck (e.g. "Centrifugal" struck, "loses nutrients").
const line = z.object({ text: z.string(), strike: z.boolean().default(false), note: z.string().optional() });

// A photo spread and a few lines. "band": photos across the middle, lines below.
// "split": a tall photo panel on the right, lines in a column on the left.
export const spreadScene = z.object({
  type: z.literal("spread"),
  layout: z.enum(["band", "split"]),
  kicker: z.string(),
  headline: z.string(),
  sub: z.string().optional(),
  photo,
  prints: z.array(photo).max(2).default([]),
  lines: z.array(line).max(3).default([]),
  ...base,
});

// Steps in a row of photos joined by drawn arrows, with a caption under each.
export const stepsScene = z.object({
  type: z.literal("steps"),
  kicker: z.string(),
  headline: z.string(),
  steps: z.array(z.object({ label: z.string(), photo })).min(2).max(3),
  note: z.string().optional(),
  ...base,
});

// Proportion bars that grow from the left, one row per variant.
export const barsScene = z.object({
  type: z.literal("bars"),
  kicker: z.string(),
  headline: z.string(),
  rows: z
    .array(
      z.object({
        title: z.string(),
        parts: z
          .array(
            z.object({
              label: z.string(),
              share: z.number().min(0.05).max(1),
              color: z.enum(["seriesA", "seriesB", "seriesC", "seriesD", "water"]),
              // Optional photo chip beside the part's label.
              photo: photo.optional(),
            }),
          )
          .min(1)
          .max(3),
        note: z.string().optional(),
      }),
    )
    .min(1)
    .max(3),
  ...base,
});

// Back cover with the short version (kept for topics that want a recap).
export const takeawayScene = z.object({
  type: z.literal("takeaway"),
  kicker: z.string(),
  lines: z.array(z.string()).min(1).max(4),
  photos: z.array(photo).min(1).max(2),
  ...base,
});

export const scene = z.discriminatedUnion("type", [
  coverScene,
  timelineScene,
  statScene,
  nextScene,
  takeawayScene,
  spreadScene,
  stepsScene,
  barsScene,
]);

export const topicSchema = z.object({
  // Also the composition id and output folder name, e.g. "binary-search".
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  scenes: z.array(scene).min(1),
  showSafeArea: z.boolean().default(false),
});

export type Photo = z.infer<typeof photo>;
export type Scene = z.infer<typeof scene>;
export type SceneType = Scene["type"];
export type SceneOf<T extends SceneType> = Extract<Scene, { type: T }>;
// What topic files are written as (defaults optional) vs. what the video renders from.
export type TopicInput = z.input<typeof topicSchema>;
export type Topic = z.output<typeof topicSchema>;
