import { healthRepo } from "./health.repo.js";

export const healthService = {
  getHealth: () => healthRepo.getHealth(),
  getRoot: () => healthRepo.getRoot(),
};
