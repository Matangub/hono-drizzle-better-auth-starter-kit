import { getEndpoints } from "better-auth/api";

import { auth } from "../../auth.js";
import type { OpenApiSpec } from "./docs.types.js";

type OpenApiOperation = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizePath = (path: string): string =>
  path.replaceAll(/:([A-Za-z0-9_]+)/g, "{$1}");

const normalizeMethods = (method: unknown): string[] => {
  if (Array.isArray(method)) {
    return method
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.toLowerCase());
  }

  if (typeof method === "string") {
    return [method.toLowerCase()];
  }

  return ["get"];
};

const withDefaultResponses = (
  operation: OpenApiOperation
): OpenApiOperation => {
  if ("responses" in operation) {
    return operation;
  }

  return {
    ...operation,
    responses: {
      "200": {
        description: "Success",
      },
    },
  };
};

export const docsRepo = {
  createSpec: async (): Promise<OpenApiSpec> => {
    const paths: Record<string, Record<string, OpenApiOperation>> = {
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
    };

    const authContext = (await auth.$context) as unknown as Parameters<
      typeof getEndpoints
    >[0];
    const { api } = getEndpoints(authContext, auth.options);

    for (const endpoint of Object.values(api)) {
      if (typeof endpoint.path !== "string") {
        continue;
      }

      const endpointPath = `/api/auth${normalizePath(endpoint.path)}`;
      const endpointOptions = endpoint.options as unknown;

      if (!isRecord(endpointOptions)) {
        continue;
      }

      const endpointMetadata = isRecord(endpointOptions.metadata)
        ? endpointOptions.metadata
        : null;

      const endpointOpenApi =
        endpointMetadata?.openapi ?? endpointOptions.openapi;

      if (!isRecord(endpointOpenApi) || endpointOpenApi.disabled === true) {
        continue;
      }

      const methods = normalizeMethods(endpointOptions.method);

      if (!(endpointPath in paths)) {
        paths[endpointPath] = {};
      }

      for (const method of methods) {
        const operationWithTags: OpenApiOperation = {
          ...endpointOpenApi,
          tags:
            Array.isArray(endpointOpenApi.tags) &&
            endpointOpenApi.tags.length > 0
              ? endpointOpenApi.tags
              : ["better-auth"],
        };

        paths[endpointPath][method] = withDefaultResponses(operationWithTags);
      }
    }

    return {
      info: {
        title: "Hono Better Auth Starter API",
        version: "1.0.0",
      },
      openapi: "3.1.0",
      paths,
    };
  },
};
