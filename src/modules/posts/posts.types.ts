import type { z } from "@hono/zod-openapi";

import type {
  createPostBodySchema,
  postSchema,
  postsResponseSchema,
  unauthorizedResponseSchema,
} from "./posts.schema.js";

export type CreatePostBody = z.infer<typeof createPostBodySchema>;
export type Post = z.infer<typeof postSchema>;
export type PostsResponse = z.infer<typeof postsResponseSchema>;
export type UnauthorizedResponse = z.infer<typeof unauthorizedResponseSchema>;
