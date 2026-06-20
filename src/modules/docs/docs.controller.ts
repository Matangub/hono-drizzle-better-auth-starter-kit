import type { Context } from "hono";

import { docsService } from "./docs.service.js";

export const docsController = {
  getOpenApiDocument: async (c: Context) =>
    c.json(await docsService.getOpenApiSpec()),
};
