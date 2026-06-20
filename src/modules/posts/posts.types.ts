import type { z } from "@hono/zod-openapi";

import type { createPostBodySchema, postSchema } from "./posts.schema.js";

export type CreatePostBody = z.infer<typeof createPostBodySchema>;
export type Post = z.infer<typeof postSchema>;
