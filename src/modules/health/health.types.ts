import type { z } from "@hono/zod-openapi";

import type {
  healthResponseSchema,
  rootResponseSchema,
} from "./health.schema.js";

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type RootResponse = z.infer<typeof rootResponseSchema>;
