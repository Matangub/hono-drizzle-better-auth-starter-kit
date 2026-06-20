import { getEndpoints } from "better-auth/api";

import { auth } from "../../auth.js";
import healthRoutes from "../health/health.routes.js";
import postsRoutes from "../posts/posts.routes.js";
import { docsRepo } from "./docs.repo.js";

type OpenApiOperation = Record<string, unknown>;

type OpenApiPaths = Record<string, Record<string, OpenApiOperation>>;

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

const prefixPaths = (paths: OpenApiPaths, prefix: string): OpenApiPaths => {
  const normalizedPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  const prefixedPaths: OpenApiPaths = {};

  for (const [path, operations] of Object.entries(paths)) {
    const prefixedPath = `${normalizedPrefix}${path === "/" ? "" : path}`;
    prefixedPaths[prefixedPath] = operations;
  }

  return prefixedPaths;
};

const mergePaths = (...pathGroups: OpenApiPaths[]): OpenApiPaths =>
  pathGroups.reduce<OpenApiPaths>((mergedPaths, currentPaths) => {
    for (const [path, operations] of Object.entries(currentPaths)) {
      mergedPaths[path] = {
        ...(mergedPaths[path] ?? {}),
        ...operations,
      };
    }

    return mergedPaths;
  }, {});

const getModulePaths = (): OpenApiPaths => {
  const objectConfig = {
    info: {
      title: "Hono Better Auth Starter API",
      version: "1.0.0",
    },
    openapi: "3.1.0",
  };

  const healthDocument = healthRoutes.getOpenAPI31Document(objectConfig);
  const postsDocument = postsRoutes.getOpenAPI31Document(objectConfig);

  return mergePaths(
    (healthDocument.paths ?? {}) as OpenApiPaths,
    prefixPaths((postsDocument.paths ?? {}) as OpenApiPaths, "/posts")
  );
};

const extractOpenApiSpec = (
  endpointOptions: Record<string, unknown>
): Record<string, unknown> | null => {
  const endpointMetadata = isRecord(endpointOptions.metadata)
    ? endpointOptions.metadata
    : null;

  const endpointOpenApi = endpointMetadata?.openapi ?? endpointOptions.openapi;

  if (!isRecord(endpointOpenApi) || endpointOpenApi.disabled === true) {
    return null;
  }

  return endpointOpenApi;
};

const buildOperationWithTags = (
  openApiSpec: Record<string, unknown>
): OpenApiOperation => ({
  ...openApiSpec,
  tags:
    Array.isArray(openApiSpec.tags) && openApiSpec.tags.length > 0
      ? openApiSpec.tags
      : ["better-auth"],
});

const addEndpointOperation = (
  paths: OpenApiPaths,
  endpointPath: string,
  methods: string[],
  operation: OpenApiOperation
): void => {
  if (!(endpointPath in paths)) {
    paths[endpointPath] = {};
  }

  for (const method of methods) {
    paths[endpointPath][method] = withDefaultResponses(operation);
  }
};

const getBetterAuthPaths = async (): Promise<OpenApiPaths> => {
  const authContext = await auth.$context;
  const { api } = getEndpoints(
    authContext as unknown as Parameters<typeof getEndpoints>[0],
    auth.options
  );

  const paths: OpenApiPaths = {};

  for (const endpoint of Object.values(api)) {
    if (typeof endpoint.path !== "string") {
      continue;
    }

    const endpointOptions = endpoint.options as unknown;

    if (!isRecord(endpointOptions)) {
      continue;
    }

    const openApiSpec = extractOpenApiSpec(endpointOptions);
    if (!openApiSpec) {
      continue;
    }

    const endpointPath = `/api/auth${normalizePath(endpoint.path)}`;
    const methods = normalizeMethods(endpointOptions.method);
    const operation = buildOperationWithTags(openApiSpec);

    addEndpointOperation(paths, endpointPath, methods, operation);
  }

  return paths;
};

export const docsService = {
  getOpenApiSpec: async () =>
    docsRepo.createSpec(
      mergePaths(getModulePaths(), await getBetterAuthPaths())
    ),
};
