import { z } from "@hono/zod-openapi";

export const healthResponseSchema = z
  .object({
    status: z.literal("ok"),
    timestamp: z.string().openapi({ example: "2026-06-20T12:00:00.000Z" }),
  })
  .openapi("HealthResponse");

export const rootResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Hello Hono!" }),
  })
  .openapi("RootResponse");
