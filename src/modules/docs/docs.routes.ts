import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";

import { docsController } from "./docs.controller.js";

const docsRoutes = new Hono();

docsRoutes.get("/doc", docsController.getOpenApiDocument);
docsRoutes.get(
  "/scalar",
  Scalar({
    pageTitle: "Hono Better Auth Starter API",
    url: "/doc",
  })
);

export default docsRoutes;
