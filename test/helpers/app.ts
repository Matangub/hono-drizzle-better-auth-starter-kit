import type { app as appType } from "../../src/app.js";
import { env } from "../../src/env.js";

let appPromise: Promise<typeof appType> | null = null;

export const getApp = (): Promise<typeof appType> => {
  if (!appPromise) {
    appPromise = import("../../src/app.ts").then((module) => module.app);
  }

  return appPromise;
};

export const createAppRequest = (path: string, init?: RequestInit): Request =>
  new Request(`${env.BETTER_AUTH_URL}${path}`, init);

export const requestApp = async (
  path: string,
  init?: RequestInit
): Promise<Response> => {
  const app = await getApp();
  return app.fetch(createAppRequest(path, init));
};
