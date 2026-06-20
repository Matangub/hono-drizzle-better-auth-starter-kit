import type { auth } from "../auth.js";

export type SessionUser = typeof auth.$Infer.Session.user;
export type SessionData = typeof auth.$Infer.Session.session;

export interface AppVariables {
  readonly session: SessionData | null;
  readonly user: SessionUser | null;
}
