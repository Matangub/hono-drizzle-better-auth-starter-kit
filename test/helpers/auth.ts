import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { session, user } from "../../src/db/better-auth-schema.js";
import { db } from "../../src/db/client.js";
import { requestApp } from "./app.js";

const JSON_HEADERS = {
  "content-type": "application/json",
} as const;

export interface SignedUpUser {
  email: string;
  password: string;
  sessionCookie: string;
  userId: string;
}

const getSessionCookie = (headers: Headers): string => {
  const cookieHeaders =
    "getSetCookie" in headers
      ? (headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
      : ([headers.get("set-cookie")].filter(Boolean) as string[]);

  return cookieHeaders.map((value) => value.split(";")[0]).join("; ");
};

export const signUpUser = async (params: {
  emailPrefix: string;
  name: string;
  password?: string;
}): Promise<SignedUpUser> => {
  const password = params.password ?? "Password123!";
  const email = `${params.emailPrefix}-${randomUUID()}@example.com`;

  const signUpResponse = await requestApp("/api/auth/sign-up/email", {
    body: JSON.stringify({
      email,
      name: params.name,
      password,
    }),
    headers: JSON_HEADERS,
    method: "POST",
  });

  if (!signUpResponse.ok) {
    throw new Error(`Sign up failed with status ${signUpResponse.status}`);
  }

  const [createdUser] = await db
    .select({
      id: user.id,
    })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!createdUser) {
    throw new Error("Could not load created user from database");
  }

  const sessionCookie = getSessionCookie(signUpResponse.headers);

  return {
    email,
    password,
    sessionCookie,
    userId: createdUser.id,
  };
};

export const setUserGlobalRole = async (
  email: string,
  role: string
): Promise<void> => {
  await db.update(user).set({ role }).where(eq(user.email, email));
};

export const setActiveOrganizationForUser = async (
  userId: string,
  organizationId: string
): Promise<void> => {
  await db
    .update(session)
    .set({ activeOrganizationId: organizationId })
    .where(eq(session.userId, userId));
};
