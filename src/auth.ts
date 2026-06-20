import { apiKey } from "@better-auth/api-key";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { admin, organization as organizationPlugin } from "better-auth/plugins";
import {
  account,
  accountRelations,
  apikey,
  invitation,
  invitationRelations,
  member,
  memberRelations,
  organization,
  organizationRelations,
  session,
  sessionRelations,
  user,
  userRelations,
  verification,
} from "./db/better-auth-schema.js";
import { db } from "./db/client.js";
import { env } from "./env.js";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    schema: {
      account,
      accountRelations,
      apikey,
      invitation,
      invitationRelations,
      member,
      memberRelations,
      organization,
      organizationRelations,
      session,
      sessionRelations,
      user,
      userRelations,
      verification,
    },
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organizationPlugin(),
    admin({
      defaultRole: env.BETTER_AUTH_ADMIN_DEFAULT_ROLE,
    }),
    apiKey(),
  ],
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS,
});
