import type { infer as Infer } from "zod";

import type {
  healthResponseSchema,
  rootResponseSchema,
} from "./health.schema.js";

export type HealthResponse = Infer<typeof healthResponseSchema>;
export type RootResponse = Infer<typeof rootResponseSchema>;
