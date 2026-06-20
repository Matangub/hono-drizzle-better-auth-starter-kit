import { postsRepo } from "./posts.repo.js";
import type { CreatePostBody, Post } from "./posts.types.js";

export const postsService = {
  createPost: async (input: CreatePostBody, userId: string): Promise<Post> =>
    postsRepo.createPost(input, userId),
  listPosts: async (): Promise<Post[]> => postsRepo.listPosts(),
};
