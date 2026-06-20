import type { HealthResponse, RootResponse } from "./health.types.js";

export const healthRepo = {
  getHealth: (): HealthResponse => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }),
  getRoot: (): RootResponse => ({
    message: "Hello Hono!",
  }),
};
