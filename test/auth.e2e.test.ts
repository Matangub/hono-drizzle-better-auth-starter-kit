import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { user } from "../src/db/better-auth-schema.js";
import { db } from "../src/db/client.js";
import { env } from "../src/env.js";

const getSessionCookie = (headers: Headers): string => {
  const cookieHeaders =
    "getSetCookie" in headers
      ? (headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
      : ([headers.get("set-cookie")].filter(Boolean) as string[]);

  return cookieHeaders.map((value) => value.split(";")[0]).join("; ");
};

describe("auth e2e", () => {
  it("signs up a user and exposes an authenticated session", async () => {
    const { app } = await import("../src/app.ts");
    const email = `test-${randomUUID()}@example.com`;
    const password = "Password123!";
    const name = "Test User";

    const signUpResponse = await app.fetch(
      new Request(`${env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      })
    );

    expect(signUpResponse.ok).toBe(true);
    const sessionCookie = getSessionCookie(signUpResponse.headers);
    expect(sessionCookie.length).toBeGreaterThan(0);

    const sessionResponse = await app.fetch(
      new Request(`${env.BETTER_AUTH_URL}/session`, {
        headers: {
          cookie: sessionCookie,
        },
      })
    );

    expect(sessionResponse.ok).toBe(true);

    const sessionBody = (await sessionResponse.json()) as {
      user: { email: string };
    };

    expect(sessionBody.user.email).toBe(email);
  });

  it("creates an API key for an authenticated user", async () => {
    const { app } = await import("../src/app.ts");
    const email = `api-key-${randomUUID()}@example.com`;
    const password = "Password123!";
    const name = "Api User";

    const signUpResponse = await app.fetch(
      new Request(`${env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      })
    );

    expect(signUpResponse.ok).toBe(true);
    const sessionCookie = getSessionCookie(signUpResponse.headers);

    const apiKeyResponse = await app.fetch(
      new Request(`${env.BETTER_AUTH_URL}/api/auth/api-key/create`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: sessionCookie,
        },
        body: JSON.stringify({
          name: "integration-key",
        }),
      })
    );

    expect(apiKeyResponse.ok).toBe(true);

    const apiKeyBody = (await apiKeyResponse.json()) as {
      key?: string;
      id?: string;
    };

    expect(apiKeyBody.key).toBeTruthy();
    expect(apiKeyBody.id).toBeTruthy();
  });

  it("allows an admin user to list users", async () => {
    const { app } = await import("../src/app.ts");
    const email = `admin-${randomUUID()}@example.com`;
    const password = "Password123!";
    const name = "Admin User";

    const signUpResponse = await app.fetch(
      new Request(`${env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      })
    );

    expect(signUpResponse.ok).toBe(true);

    await db.update(user).set({ role: "admin" }).where(eq(user.email, email));

    const sessionCookie = getSessionCookie(signUpResponse.headers);

    const listUsersResponse = await app.fetch(
      new Request(`${env.BETTER_AUTH_URL}/api/auth/admin/list-users`, {
        method: "GET",
        headers: {
          cookie: sessionCookie,
        },
      })
    );

    expect(listUsersResponse.ok).toBe(true);

    const listUsersBody = (await listUsersResponse.json()) as {
      users?: Array<{ email: string }>;
    };

    expect(Array.isArray(listUsersBody.users)).toBe(true);
    expect(listUsersBody.users?.some((user) => user.email === email)).toBe(
      true
    );
  });

  it("creates an organization for an authenticated user", async () => {
    const { app } = await import("../src/app.ts");
    const suffix = randomUUID();
    const email = `org-${suffix}@example.com`;
    const password = "Password123!";
    const name = "Org User";

    const signUpResponse = await app.fetch(
      new Request(`${env.BETTER_AUTH_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      })
    );

    expect(signUpResponse.ok).toBe(true);
    const sessionCookie = getSessionCookie(signUpResponse.headers);

    const organizationResponse = await app.fetch(
      new Request(`${env.BETTER_AUTH_URL}/api/auth/organization/create`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: sessionCookie,
        },
        body: JSON.stringify({
          name: `Org ${suffix}`,
          slug: `org-${suffix}`,
        }),
      })
    );

    expect(organizationResponse.ok).toBe(true);
    const organizationBody = (await organizationResponse.json()) as {
      id?: string;
      name?: string;
      slug?: string;
    };

    expect(organizationBody.id).toBeTruthy();
    expect(organizationBody.slug).toBe(`org-${suffix}`);
  });
});
