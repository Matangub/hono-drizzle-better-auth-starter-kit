import { z } from "@hono/zod-openapi";

export const createPostBodySchema = z
  .object({
    content: z
      .string()
      .min(1)
      .openapi({ example: "This is the first post content." }),
    title: z.string().min(1).openapi({ example: "First post" }),
  })
  .openapi("CreatePostBody");

export const postSchema = z
  .object({
    content: z.string(),
    createdAt: z.string().datetime(),
    createdBy: z.string().nullable(),
    id: z.string().openapi({ example: "post_123" }),
    title: z.string(),
    updatedAt: z.string().datetime(),
    updatedBy: z.string().nullable(),
  })
  .openapi("Post");

export const postsResponseSchema = z.array(postSchema).openapi("PostsResponse");

export const unauthorizedResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Unauthorized" }),
  })
  .openapi("UnauthorizedResponse");

export const forbiddenResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Forbidden" }),
  })
  .openapi("ForbiddenResponse");

export const badRequestResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Active organization is required" }),
  })
  .openapi("BadRequestResponse");
