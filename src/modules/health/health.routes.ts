import { Hono } from "hono";

import { healthController } from "./health.controller.js";

const healthRoutes = new Hono();

healthRoutes.get("/", healthController.getRoot);
healthRoutes.get("/health", healthController.getHealth);

export default healthRoutes;
