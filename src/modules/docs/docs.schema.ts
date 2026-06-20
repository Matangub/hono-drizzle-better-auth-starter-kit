import { z } from "zod";

export const openApiSpecSchema = z.object({
  info: z.object({
    title: z.string(),
    version: z.string(),
  }),
  openapi: z.string(),
  paths: z.record(z.string(), z.unknown()),
});
