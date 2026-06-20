import { auth } from "../../auth.js";

const ADMIN_ROLES = new Set(["admin", "owner"]);

const extractRole = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null && "role" in value) {
    const nestedRole = (value as { role?: unknown }).role;
    return typeof nestedRole === "string" ? nestedRole : null;
  }

  return null;
};

export const authService = {
  listAccessibleOrganizationIds: async (
    headers: Headers
  ): Promise<string[]> => {
    const organizations = await auth.api.listOrganizations({ headers });

    return organizations
      .map((organization) => organization.id)
      .filter(
        (organizationId): organizationId is string =>
          typeof organizationId === "string"
      );
  },

  isOrganizationAdmin: async (
    headers: Headers,
    organizationId: string
  ): Promise<boolean> => {
    const activeMemberRole = await auth.api.getActiveMemberRole({
      headers,
      query: {
        organizationId,
      },
    });

    const role = extractRole(activeMemberRole.role);
    return role ? ADMIN_ROLES.has(role) : false;
  },
};
