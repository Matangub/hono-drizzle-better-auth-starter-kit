import { randomUUID } from "node:crypto";
import { desc, type InferSelectModel } from "drizzle-orm";
import { posts } from "../../db/app-schema.js";
import { db } from "../../db/client.js";
import type { CreatePostBody, Post } from "./posts.types.js";

type PostRow = InferSelectModel<typeof posts>;

const serializePost = (post: PostRow): Post => ({
  content: post.content,
  createdAt: post.createdAt.toISOString(),
  createdBy: post.createdBy,
  id: post.id,
  title: post.title,
  updatedAt: post.updatedAt.toISOString(),
  updatedBy: post.updatedBy,
});

export const postsRepo = {
  createPost: async (input: CreatePostBody, userId: string): Promise<Post> => {
    const [post] = await db
      .insert(posts)
      .values({
        content: input.content,
        createdBy: userId,
        id: randomUUID(),
        title: input.title,
        updatedBy: userId,
      })
      .returning();

    if (!post) {
      throw new Error("Failed to create post");
    }

    return serializePost(post);
  },
  listPosts: async (): Promise<Post[]> => {
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));

    return allPosts.map(serializePost);
  },
};
