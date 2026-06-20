import type { Context } from "hono";

import { docsService } from "./docs.service.js";

export const docsController = {
  getOpenApiDocument: (c: Context) => c.json(docsService.getOpenApiSpec()),
};
