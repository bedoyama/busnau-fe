"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/api/authService";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
} from "@/api/authStorage";
import { userService } from "@/api/userService";
import type { LoginRequest } from "@/lib/model/loginRequest";
import type { LoginResponse } from "@/lib/model/loginResponse";
import type { User } from "@/lib/model/user";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  /** True while login/register/logout network work is in flight */
  busy: boolean;
  login: (body: LoginRequest) => Promise<string | null>;
  /** Register, then login. Returns error message or null on success. */
  register: (body: LoginRequest) => Promise<string | null>;
  /** Revoke current refresh token and clear local session. */
  logout: () => Promise<void>;
  /** Revoke all refresh tokens for this user and clear local session. */
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function userFromLogin(data: LoginResponse): User {
  return {
    id: data.id,
    username: data.username,
    role: data.role,
  };
}

async function loadCurrentUser(): Promise<
  { ok: true; user: User } | { ok: false }
> {
  const token = getAccessToken();
  if (!token) {
    return { ok: false };
  }

  const [me, error] = await userService.getCurrentUser();
  if (error || !me) {
    clearSession();
    return { ok: false };
  }
  return { ok: true, user: me };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [busy, setBusy] = useState(false);

  const applyAnonymous = useCallback(() => {
    setUser(null);
    setStatus("anonymous");
  }, []);

  const applyUser = useCallback((next: User) => {
    setUser(next);
    setStatus("authenticated");
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await loadCurrentUser();
    if (result.ok) {
      applyUser(result.user);
    } else {
      applyAnonymous();
    }
  }, [applyAnonymous, applyUser]);

  // Session bootstrap: await first so setState is not synchronous in the effect
  // (eslint react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await loadCurrentUser();
      if (cancelled) return;
      if (result.ok) {
        applyUser(result.user);
      } else {
        applyAnonymous();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyAnonymous, applyUser]);

  const login = useCallback(
    async (body: LoginRequest): Promise<string | null> => {
      setBusy(true);
      const [data, error] = await authService.login(body);
      setBusy(false);

      if (error || !data) {
        return error ?? "Login failed";
      }

      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      applyUser(userFromLogin(data));
      return null;
    },
    [applyUser]
  );

  const register = useCallback(
    async (body: LoginRequest): Promise<string | null> => {
      setBusy(true);
      const [, registerError] = await authService.register(body);
      if (registerError) {
        setBusy(false);
        return registerError;
      }

      const [data, loginError] = await authService.login(body);
      setBusy(false);

      if (loginError || !data) {
        return (
          loginError ??
          "Account created but sign-in failed — try logging in manually"
        );
      }

      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      applyUser(userFromLogin(data));
      return null;
    },
    [applyUser]
  );

  const finishSignedOut = useCallback(async () => {
    clearSession();
    applyAnonymous();
    setBusy(false);
    router.push("/login");
  }, [applyAnonymous, router]);

  const logout = useCallback(async () => {
    setBusy(true);
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await authService.logout({ refreshToken });
    }
    await finishSignedOut();
  }, [finishSignedOut]);

  const logoutAll = useCallback(async () => {
    setBusy(true);
    // Best-effort: still clear local session if the request fails (e.g. expired access).
    await authService.logoutAll();
    await finishSignedOut();
  }, [finishSignedOut]);

  const value = useMemo(
    () => ({
      user,
      status,
      busy,
      login,
      register,
      logout,
      logoutAll,
      refreshUser,
    }),
    [user, status, busy, login, register, logout, logoutAll, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
