import { Hono } from "hono";
import { cors } from "hono/cors";

import { auth } from "./auth.js";
import { env } from "./env.js";

type SessionUser = typeof auth.$Infer.Session.user;
type SessionData = typeof auth.$Infer.Session.session;

type AppBindings = Record<string, never>;

interface AppVariables {
  readonly session: SessionData | null;
  readonly user: SessionUser | null;
}

const authOrigin = new URL(env.BETTER_AUTH_URL).origin;

export const app = new Hono<{
  Bindings: AppBindings;
  Variables: AppVariables;
}>();

app.use(
  "/api/auth/*",
  cors({
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "OPTIONS", "POST"],
    credentials: true,
    origin: authOrigin,
  })
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => c.text("Hello Hono!"));

app.get("/session", (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user) {
    return c.body(null, 401);
  }

  return c.json({
    session,
    user,
  });
});
