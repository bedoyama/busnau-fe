/**
 * Browser session tokens for busnau-api JWT auth.
 *
 * Keys:
 * - `token` — access JWT (Bearer), kept for backward compatibility with earlier FE code
 * - `refreshToken` — refresh JWT for /api/auth/refresh and logout
 *
 * Only use from client components / browser hooks (localStorage).
 */

export const ACCESS_TOKEN_KEY = "token";
export const REFRESH_TOKEN_KEY = "refreshToken";

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setSession(session: StoredSession): void {
  if (!canUseStorage()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
}

/** Update access token only (after refresh). */
export function setAccessToken(accessToken: string): void {
  if (!canUseStorage()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearSession(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasSession(): boolean {
  return Boolean(getAccessToken());
}
