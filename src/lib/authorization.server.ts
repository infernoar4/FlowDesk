import {
  requireAuthenticatedUser,
  requireEmployee,
  requireManager,
  requireSupportEngineer,
  type AuthenticatedRole,
} from "./auth-session.server";

/** Session-backed authorization identity. Client view switchers are never trusted. */
export type AuthorizedUser = {
  id: number;
  fullName: string;
  role: AuthenticatedRole;
};

function toAuthorizedUser(
  user: Awaited<ReturnType<typeof requireAuthenticatedUser>>,
): AuthorizedUser {
  return { id: user.id, fullName: user.fullName, role: user.role };
}

export async function getCurrentEmployee(): Promise<AuthorizedUser> {
  return toAuthorizedUser(await requireEmployee());
}

export async function getCurrentManager(): Promise<AuthorizedUser> {
  return toAuthorizedUser(await requireManager());
}

/** Legacy UI arguments are ignored: the authenticated support user is the actor. */
export async function getCurrentSupportEngineer(
  _legacySelectedEngineer?: string,
): Promise<AuthorizedUser> {
  return toAuthorizedUser(await requireSupportEngineer());
}

export { requireAuthenticatedUser, requireEmployee, requireManager, requireSupportEngineer };
