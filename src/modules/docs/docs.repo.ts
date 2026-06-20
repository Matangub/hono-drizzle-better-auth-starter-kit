import type { OpenApiSpec } from "./docs.types.js";

export const docsRepo = {
  createSpec: (): OpenApiSpec => ({
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
      "/session": {
        get: {
          responses: {
            "200": {
              description: "Authenticated session response",
            },
            "401": {
              description: "No active session",
            },
          },
          summary: "Get current user session",
          tags: ["session"],
        },
      },
      "/api/auth/{path}": {
        get: {
          description:
            "Better Auth passthrough route mounted from Hono integration.",
          parameters: [
            {
              in: "path",
              name: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Handled by Better Auth",
            },
          },
          summary: "Better Auth GET route",
          tags: ["auth"],
        },
        post: {
          description:
            "Better Auth passthrough route mounted from Hono integration.",
          parameters: [
            {
              in: "path",
              name: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            "200": {
              description: "Handled by Better Auth",
            },
          },
          summary: "Better Auth POST route",
          tags: ["auth"],
        },
      },
    },
  }),
};
