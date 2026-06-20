import type { Context } from "hono";

import { healthService } from "./health.service.js";

export const healthController = {
  getHealth: (c: Context) => c.json(healthService.getHealth()),
  getRoot: (c: Context) => c.json(healthService.getRoot()),
};
