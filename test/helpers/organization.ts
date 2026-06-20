import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { member } from "../../src/db/better-auth-schema.js";
import { db } from "../../src/db/client.js";
import { requestApp } from "./app.js";

const JSON_HEADERS = {
  "content-type": "application/json",
} as const;

export interface Organization {
  id: string;
  slug: string;
}

export const createOrganization = async (
  sessionCookie: string,
  prefix: string
): Promise<Organization> => {
  const suffix = randomUUID();
  const response = await requestApp("/api/auth/organization/create", {
    body: JSON.stringify({
      name: `${prefix}-${suffix}`,
      slug: `${prefix}-${suffix}`,
    }),
    headers: {
      ...JSON_HEADERS,
      cookie: sessionCookie,
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Organization creation failed with status ${response.status}`
    );
  }

  const body = (await response.json()) as Partial<Organization>;
  if (!(body.id && body.slug)) {
    throw new Error("Organization response did not include id and slug");
  }

  return {
    id: body.id,
    slug: body.slug,
  };
};

export const setOrganizationRoleForUser = async (
  userId: string,
  organizationId: string,
  role: "admin" | "member"
): Promise<void> => {
  const [existingMember] = await db
    .select({
      id: member.id,
    })
    .from(member)
    .where(
      and(eq(member.organizationId, organizationId), eq(member.userId, userId))
    )
    .limit(1);

  if (existingMember) {
    await db
      .update(member)
      .set({ role })
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, userId)
        )
      );
    return;
  }

  await db.insert(member).values({
    createdAt: new Date(),
    id: randomUUID(),
    organizationId,
    role,
    userId,
  });
};
