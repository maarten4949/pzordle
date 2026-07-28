import { defineCollection, reference } from "astro:content";

import { glob } from "astro/loaders";

import { z } from "astro/zod";

const patchnotes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/patchnotes" }),
  schema: () =>
    z.object({
      title: z.string().min(1).max(100),
      date: z.coerce.date(),
    }),
});

export const collections = {
  patchnotes,
};
