import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import type { AppVariables } from "../../types/app-context.js";
import { authService } from "../auth/auth.service.js";
import {
  badRequestResponseSchema,
  createPostBodySchema,
  forbiddenResponseSchema,
  postSchema,
  postsResponseSchema,
  unauthorizedResponseSchema,
} from "./posts.schema.js";
import { postsService } from "./posts.service.js";

const postsRoutes = new OpenAPIHono<{ Variables: AppVariables }>();

postsRoutes.use("*", async (c, next) => {
  if (!c.get("user")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  await next();
});

const listPostsRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    401: {
      content: {
        "application/json": {
          schema: unauthorizedResponseSchema,
        },
      },
      description: "Unauthorized",
    },
    200: {
      content: {
        "application/json": {
          schema: postsResponseSchema,
        },
      },
      description: "List posts",
    },
  },
});

const createPostRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createPostBodySchema,
        },
      },
    },
  },
  responses: {
    400: {
      content: {
        "application/json": {
          schema: badRequestResponseSchema,
        },
      },
      description: "Missing active organization",
    },
    401: {
      content: {
        "application/json": {
          schema: unauthorizedResponseSchema,
        },
      },
      description: "Unauthorized",
    },
    403: {
      content: {
        "application/json": {
          schema: forbiddenResponseSchema,
        },
      },
      description: "Only organization admins can create posts",
    },
    201: {
      content: {
        "application/json": {
          schema: postSchema,
        },
      },
      description: "Create post",
    },
  },
});

postsRoutes.openapi(listPostsRoute, async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const organizationIds = await authService.listAccessibleOrganizationIds(
    c.req.raw.headers
  );

  const posts = await postsService.listPosts(organizationIds, user.id);
  return c.json(posts);
});

postsRoutes.openapi(createPostRoute, async (c) => {
  const input = c.req.valid("json");
  const user = c.get("user");

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;

  if (!organizationId) {
    return c.json({ message: "Active organization is required" }, 400);
  }

  const isOrganizationAdmin = await authService.isOrganizationAdmin(
    c.req.raw.headers,
    organizationId
  );

  if (!isOrganizationAdmin) {
    return c.json({ message: "Forbidden" }, 403);
  }

  const post = await postsService.createPost(input, user.id, organizationId);
  return c.json(post, 201);
});

export default postsRoutes;
