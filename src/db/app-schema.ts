import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { organization, user } from "./better-auth-schema.js";

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
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
});

export type AuditColumns = ReturnType<typeof createAuditColumns>;

export const posts = pgTable(
  "posts",
  {
    content: text("content").notNull(),
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    ...createAuditColumns(),
  },
  (table) => [
    index("posts_created_by_idx").on(table.createdBy),
    index("posts_organization_id_idx").on(table.organizationId),
  ]
);
