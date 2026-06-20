import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
});

export const rootResponseSchema = z.object({
  message: z.string(),
});
