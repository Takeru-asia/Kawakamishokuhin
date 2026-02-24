// Shared constants for auth (used by both server code and Edge middleware).
// IMPORTANT: This file must NOT import any Node.js or server-side libraries
// because Next.js middleware runs in the Edge runtime.

const DEV_SECRET = "kawakami-haccp-dev-secret-key";

/**
 * Resolve the raw JWT secret string.
 * - In production (or any non-development env): JWT_SECRET env var is required.
 * - In development: falls back to a default dev-only secret.
 */
function getJwtSecretString(): string {
  const secret = process.env.JWT_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "development") {
    return DEV_SECRET;
  }

  throw new Error(
    "JWT_SECRET environment variable is not set. " +
      "This is required in production. " +
      "Set JWT_SECRET in your .env file or environment."
  );
}

export const JWT_SECRET = new TextEncoder().encode(getJwtSecretString());

export const COOKIE_NAME = "haccp-token";
