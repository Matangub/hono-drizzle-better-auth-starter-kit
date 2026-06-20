import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { healthResponseSchema, rootResponseSchema } from "./health.schema.js";
import { healthService } from "./health.service.js";

const healthRoutes = new OpenAPIHono();

const rootRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: rootResponseSchema,
        },
      },
      description: "Root endpoint",
    },
  },
});

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: healthResponseSchema,
        },
      },
      description: "Health check response",
    },
  },
});

healthRoutes.openapi(rootRoute, (c) => c.json(healthService.getRoot()));
healthRoutes.openapi(healthRoute, (c) => c.json(healthService.getHealth()));

export default healthRoutes;
