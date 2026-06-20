import "dotenv/config";

import { z } from "zod";

const schema = z
  .object({
    BETTER_AUTH_ADMIN_DEFAULT_ROLE: z.enum(["admin", "user"]).default("user"),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32)
      .default("dev-secret-dev-secret-dev-secret-dev-secret"),
    BETTER_AUTH_TRUSTED_ORIGINS: z.string().default("http://localhost:3000"),
    BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    DATABASE_URL: z
      .string()
      .min(1)
      .default(
        "postgres://postgres:postgres@localhost:5432/hono_drizzle_better_auth_test"
      ),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
  })
  .transform((value) => ({
    ...value,
    BETTER_AUTH_TRUSTED_ORIGINS: value.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
  }));

export const env = schema.parse(process.env);
