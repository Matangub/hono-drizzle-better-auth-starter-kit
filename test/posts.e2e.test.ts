import { describe, expect, it } from "vitest";
import { requestApp } from "./helpers/app.js";
import { setActiveOrganizationForUser, signUpUser } from "./helpers/auth.js";
import {
  createOrganization,
  setOrganizationRoleForUser,
} from "./helpers/organization.js";

describe("posts e2e", () => {
  it("rejects unauthenticated users for create and list", async () => {
    const listResponse = await requestApp("/posts", {
      method: "GET",
    });
    expect(listResponse.status).toBe(401);

    const createResponse = await requestApp("/posts", {
      body: JSON.stringify({
        content: "content",
        title: "title",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(createResponse.status).toBe(401);
  });

  it("allows an org admin in active organization to create a post", async () => {
    const adminUser = await signUpUser({
      emailPrefix: "posts-admin",
      name: "Posts Admin",
    });

    const organization = await createOrganization(
      adminUser.sessionCookie,
      "posts-admin-org"
    );

    await setActiveOrganizationForUser(adminUser.userId, organization.id);

    const createResponse = await requestApp("/posts", {
      body: JSON.stringify({
        content: "Created by org admin",
        title: "Admin post",
      }),
      headers: {
        "content-type": "application/json",
        cookie: adminUser.sessionCookie,
      },
      method: "POST",
    });

    expect(createResponse.status).toBe(201);
  });

  it("forbids non-admin organization members from creating posts", async () => {
    const ownerUser = await signUpUser({
      emailPrefix: "owner",
      name: "Owner User",
    });
    const organization = await createOrganization(
      ownerUser.sessionCookie,
      "owner-org"
    );

    const memberUser = await signUpUser({
      emailPrefix: "member",
      name: "Member User",
    });

    await setOrganizationRoleForUser(
      memberUser.userId,
      organization.id,
      "member"
    );
    await setActiveOrganizationForUser(memberUser.userId, organization.id);

    const createResponse = await requestApp("/posts", {
      body: JSON.stringify({
        content: "Should not be created",
        title: "Member post",
      }),
      headers: {
        "content-type": "application/json",
        cookie: memberUser.sessionCookie,
      },
      method: "POST",
    });

    expect(createResponse.status).toBe(403);
  });

  it("allows members of the post organization to view posts", async () => {
    const ownerUser = await signUpUser({
      emailPrefix: "viewer-owner",
      name: "Viewer Owner",
    });
    const organization = await createOrganization(
      ownerUser.sessionCookie,
      "viewer-org"
    );
    await setActiveOrganizationForUser(ownerUser.userId, organization.id);

    const createResponse = await requestApp("/posts", {
      body: JSON.stringify({
        content: "Org scoped post",
        title: "Org scoped title",
      }),
      headers: {
        "content-type": "application/json",
        cookie: ownerUser.sessionCookie,
      },
      method: "POST",
    });

    expect(createResponse.status).toBe(201);

    const createdPost = (await createResponse.json()) as {
      id?: string;
      title?: string;
    };

    const memberUser = await signUpUser({
      emailPrefix: "viewer-member",
      name: "Viewer Member",
    });

    await setOrganizationRoleForUser(
      memberUser.userId,
      organization.id,
      "member"
    );

    const listResponse = await requestApp("/posts", {
      headers: {
        cookie: memberUser.sessionCookie,
      },
      method: "GET",
    });

    expect(listResponse.status).toBe(200);
    const posts = (await listResponse.json()) as Array<{
      id: string;
      title: string;
    }>;

    expect(posts.some((post) => post.id === createdPost.id)).toBe(true);
    expect(posts.some((post) => post.title === createdPost.title)).toBe(true);
  });

  it("does not expose posts across organizations", async () => {
    const orgAOwner = await signUpUser({
      emailPrefix: "org-a-owner",
      name: "Org A Owner",
    });
    const orgA = await createOrganization(orgAOwner.sessionCookie, "org-a");
    await setActiveOrganizationForUser(orgAOwner.userId, orgA.id);

    const createInOrgAResponse = await requestApp("/posts", {
      body: JSON.stringify({
        content: "Org A content",
        title: "Org A post",
      }),
      headers: {
        "content-type": "application/json",
        cookie: orgAOwner.sessionCookie,
      },
      method: "POST",
    });

    expect(createInOrgAResponse.status).toBe(201);
    const orgAPost = (await createInOrgAResponse.json()) as { id?: string };

    const orgBOwner = await signUpUser({
      emailPrefix: "org-b-owner",
      name: "Org B Owner",
    });
    const orgB = await createOrganization(orgBOwner.sessionCookie, "org-b");

    const viewerUser = await signUpUser({
      emailPrefix: "cross-org-viewer",
      name: "Cross Org Viewer",
    });

    await setOrganizationRoleForUser(viewerUser.userId, orgB.id, "member");

    const listResponse = await requestApp("/posts", {
      headers: {
        cookie: viewerUser.sessionCookie,
      },
      method: "GET",
    });

    expect(listResponse.status).toBe(200);
    const posts = (await listResponse.json()) as Array<{ id: string }>;

    expect(posts.some((post) => post.id === orgAPost.id)).toBe(false);
  });
});
