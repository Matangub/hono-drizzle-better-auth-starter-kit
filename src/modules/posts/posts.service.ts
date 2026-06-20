import { logger } from "../../logger.js";
import { postsRepo } from "./posts.repo.js";
import type { CreatePostBody, Post } from "./posts.types.js";

const postsLogger = logger.child({
  module: "posts",
});

export const postsService = {
  createPost: async (
    input: CreatePostBody,
    userId: string,
    organizationId: string
  ): Promise<Post> => {
    postsLogger.info({
      action: "create_post_requested",
      organizationId,
      userId,
    });

    const post = await postsRepo.createPost(input, userId, organizationId);

    postsLogger.info({
      action: "create_post_succeeded",
      organizationId,
      postId: post.id,
      userId,
    });

    return post;
  },
  listPosts: async (
    organizationIds: string[],
    userId: string
  ): Promise<Post[]> => {
    const posts = await postsRepo.listPostsByOrganizations(organizationIds);

    postsLogger.info({
      action: "list_posts_succeeded",
      organizationCount: organizationIds.length,
      postCount: posts.length,
      userId,
    });

    return posts;
  },
};
