import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";

import { docsService } from "./docs.service.js";

const docsRoutes = new Hono();

docsRoutes.get("/doc", async (c) => c.json(await docsService.getOpenApiSpec()));
docsRoutes.get(
  "/scalar",
  Scalar({
    pageTitle: "Hono Better Auth Starter API",
    url: "/doc",
  })
);

export default docsRoutes;
