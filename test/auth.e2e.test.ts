import { describe, expect, it } from "vitest";
import { requestApp } from "./helpers/app.js";
import { setUserGlobalRole, signUpUser } from "./helpers/auth.js";
import { createOrganization } from "./helpers/organization.js";

describe("auth e2e", () => {
  it("signs up a user and exposes an authenticated session", async () => {
    const signedUpUser = await signUpUser({
      emailPrefix: "test",
      name: "Test User",
    });

    const sessionCookie = signedUpUser.sessionCookie;
    expect(sessionCookie.length).toBeGreaterThan(0);

    const sessionResponse = await requestApp("/session", {
      headers: {
        cookie: sessionCookie,
      },
    });

    expect(sessionResponse.ok).toBe(true);

    const sessionBody = (await sessionResponse.json()) as {
      user: { email: string };
    };

    expect(sessionBody.user.email).toBe(signedUpUser.email);
  });

  it("creates an API key for an authenticated user", async () => {
    const signedUpUser = await signUpUser({
      emailPrefix: "api-key",
      name: "Api User",
    });

    const apiKeyResponse = await requestApp("/api/auth/api-key/create", {
      body: JSON.stringify({
        name: "integration-key",
      }),
      headers: {
        "content-type": "application/json",
        cookie: signedUpUser.sessionCookie,
      },
      method: "POST",
    });

    expect(apiKeyResponse.ok).toBe(true);

    const apiKeyBody = (await apiKeyResponse.json()) as {
      key?: string;
      id?: string;
    };

    expect(apiKeyBody.key).toBeTruthy();
    expect(apiKeyBody.id).toBeTruthy();
  });

  it("allows an admin user to list users", async () => {
    const signedUpUser = await signUpUser({
      emailPrefix: "admin",
      name: "Admin User",
    });

    await setUserGlobalRole(signedUpUser.email, "admin");

    const listUsersResponse = await requestApp("/api/auth/admin/list-users", {
      headers: {
        cookie: signedUpUser.sessionCookie,
      },
      method: "GET",
    });

    expect(listUsersResponse.ok).toBe(true);

    const listUsersBody = (await listUsersResponse.json()) as {
      users?: Array<{ email: string }>;
    };

    expect(Array.isArray(listUsersBody.users)).toBe(true);
    expect((listUsersBody.users?.length ?? 0) > 0).toBe(true);
  });

  it("creates an organization for an authenticated user", async () => {
    const signedUpUser = await signUpUser({
      emailPrefix: "org",
      name: "Org User",
    });

    const organization = await createOrganization(
      signedUpUser.sessionCookie,
      "org"
    );

    expect(organization.id).toBeTruthy();
    expect(organization.slug.startsWith("org-")).toBe(true);
  });
});
