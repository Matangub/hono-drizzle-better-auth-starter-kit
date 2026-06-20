import type { OpenApiSpec } from "./docs.types.js";

type OpenApiOperation = Record<string, unknown>;

type OpenApiPaths = Record<string, Record<string, OpenApiOperation>>;

export const docsRepo = {
  createSpec: (authPaths: OpenApiPaths = {}): OpenApiSpec => ({
    info: {
      title: "Hono Better Auth Starter API",
      version: "1.0.0",
    },
    openapi: "3.1.0",
    paths: {
      "/": {
        get: {
          responses: {
            "200": {
              description: "Root endpoint",
            },
          },
          summary: "Get root response",
          tags: ["health"],
        },
      },
      "/health": {
        get: {
          responses: {
            "200": {
              description: "Health check response",
            },
          },
          summary: "Get health status",
          tags: ["health"],
        },
      },
      ...authPaths,
    },
  }),
};
