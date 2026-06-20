import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === "development"
      ? {
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
          target: "pino-pretty",
        }
      : undefined,
});
