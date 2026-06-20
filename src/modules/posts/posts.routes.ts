import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import type { AppVariables } from "../../types/app-context.js";
import {
  createPostBodySchema,
  postSchema,
  postsResponseSchema,
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
  const posts = await postsService.listPosts();
  return c.json(posts);
});

postsRoutes.openapi(createPostRoute, async (c) => {
  const input = c.req.valid("json");
  const user = c.get("user");

  if (!user) {
    throw new Error("Unauthorized");
  }

  const post = await postsService.createPost(input, user.id);
  return c.json(post, 201);
});

export default postsRoutes;
