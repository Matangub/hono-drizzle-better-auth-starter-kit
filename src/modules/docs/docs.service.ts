import { docsRepo } from "./docs.repo.js";

export const docsService = {
  getOpenApiSpec: () => docsRepo.createSpec(),
};
