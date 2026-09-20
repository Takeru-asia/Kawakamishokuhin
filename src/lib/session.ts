import { getAuthToken, verifyToken, type JWTPayload } from "./auth";

export async function getSession(): Promise<JWTPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(allowedRoles: string[]): Promise<JWTPayload> {
  const session = await requireSession();
  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }
  return session;
}
