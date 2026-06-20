import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { auth } from "./auth.js";
import { env } from "./env.js";
import { logger } from "./logger.js";
import docsRoutes from "./modules/docs/docs.routes.js";
import healthRoutes from "./modules/health/health.routes.js";
import postsRoutes from "./modules/posts/posts.routes.js";
import type { AppVariables } from "./types/app-context.js";

export const app = new Hono<{ Variables: AppVariables }>();

app.use(
  "/api/auth/*",
  cors({
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "OPTIONS", "POST"],
    credentials: true,
    origin: new URL(env.BETTER_AUTH_URL).origin,
  })
);

app.use("*", async (c, next) => {
  const requestId = c.req.header("x-request-id") ?? randomUUID();
  const startedAt = Date.now();

  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (session) {
    c.set("user", session.user);
    c.set("session", session.session);
  } else {
    c.set("user", null);
    c.set("session", null);
  }

  await next();

  const user = c.get("user");

  logger.info({
    durationMs: Date.now() - startedAt,
    method: c.req.method,
    path: c.req.path,
    requestId,
    statusCode: c.res.status,
    userId: user?.id ?? null,
  });
});

app.route("/", healthRoutes);
app.route("/", docsRoutes);
app.route("/posts", postsRoutes);

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/session", (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!(user && session)) {
    return c.body(null, 401);
  }

  return c.json({
    session,
    user,
  });
});
