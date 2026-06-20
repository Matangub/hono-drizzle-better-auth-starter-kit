import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./better-auth-schema.js";

export const createAuditColumns = () => ({
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  updatedBy: text("updated_by").references(() => user.id, {
    onDelete: "set null",
  }),
});

export type AuditColumns = ReturnType<typeof createAuditColumns>;

export const posts = pgTable(
  "posts",
  {
    ...createAuditColumns(),
    content: text("content").notNull(),
    id: text("id").primaryKey(),
    title: text("title").notNull(),
  },
  (table) => [index("posts_created_by_idx").on(table.createdBy)]
);
