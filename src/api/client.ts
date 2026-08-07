import ky, { type KyRequest, type KyResponse, type NormalizedOptions } from "ky";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "./authStorage";
import type { RefreshResponse } from "@/lib/model/refreshResponse";

const API_PREFIX = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/** Paths that must not attach Bearer / must not trigger refresh retry. */
function isAuthBootstrapPath(url: string): boolean {
  return (
    url.includes("/api/auth/login") ||
    url.includes("/api/auth/refresh") ||
    url.includes("/api/auth/logout")
  );
}

function alreadyRetried(request: KyRequest): boolean {
  return request.headers.get("X-Auth-Retry") === "1";
}

/**
 * Raw client without auth hooks — used only for token refresh to avoid recursion.
 */
const refreshClient = ky.create({
  prefixUrl: API_PREFIX,
  timeout: 10000,
  retry: 0,
});

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  // Single-flight: concurrent 401s share one refresh
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const data = await refreshClient
        .post("api/auth/refresh", {
          json: { refreshToken },
        })
        .json<RefreshResponse>();

      if (!data?.accessToken) {
        clearSession();
        return null;
      }
      setAccessToken(data.accessToken);
      // API returns same refreshToken on success
      return data.accessToken;
    } catch {
      clearSession();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path === "/login" || path === "/register") return;
  // Soft navigation: full reload keeps MSW + env simple for now
  window.location.assign("/login");
}

export const api = ky.create({
  prefixUrl: API_PREFIX,
  timeout: 10000,

  // GET/PUT/DELETE only — never auto-retry POST (login, register, create)
  retry: {
    limit: 2,
    methods: ["get", "put", "delete"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 3000,
  },

  hooks: {
    beforeRequest: [
      (request) => {
        if (isAuthBootstrapPath(request.url)) return;
        const token = getAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (
        request: KyRequest,
        options: NormalizedOptions,
        response: KyResponse
      ): Promise<KyResponse | Response> => {
        if (response.status !== 401) return response;
        if (isAuthBootstrapPath(request.url)) return response;
        if (alreadyRetried(request)) {
          clearSession();
          redirectToLogin();
          return response;
        }

        const newAccess = await refreshAccessToken();
        if (!newAccess) {
          clearSession();
          redirectToLogin();
          return response;
        }

        const headers = new Headers(request.headers);
        headers.set("Authorization", `Bearer ${newAccess}`);
        headers.set("X-Auth-Retry", "1");

        return ky(request, {
          ...options,
          headers,
        });
      },
    ],
  },
});
