import { http, HttpResponse } from "msw";
import type { CreateUserRequest } from "@/lib/model/createUserRequest";
import type { LoginRequest } from "@/lib/model/loginRequest";
import { UserRole } from "@/lib/model/userRole";
import {
  createUser,
  findUserByUsername,
  getSessionUser,
  listUsersPage,
  setSessionUser,
} from "./userStore";

function parsePage(url: URL): { page: number; size: number } {
  const page = Number(url.searchParams.get("page") ?? "0");
  const size = Number(url.searchParams.get("size") ?? "20");
  return {
    page: Number.isFinite(page) ? page : 0,
    size: Number.isFinite(size) && size > 0 ? size : 20,
  };
}

/**
 * Stable users + predictable mock login/session for admin UI.
 * username `admin` → ADMIN; others → USER (created if missing).
 */
export const userHandlers = [
  http.post("*/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    const username = body?.username?.trim() || "user";
    const existing = findUserByUsername(username);
    const user =
      existing ??
      createUser({
        username,
        password: body?.password || "password1",
        role: username === "admin" ? UserRole.ADMIN : UserRole.USER,
      });

    setSessionUser(user);

    return HttpResponse.json({
      accessToken: `mock-access-${user.id}`,
      refreshToken: `mock-refresh-${user.id}`,
      id: user.id,
      username: user.username,
      role: user.role,
    });
  }),

  http.get("*/api/users/me", () => {
    const session = getSessionUser();
    if (!session) {
      // Bootstrap without prior login mock call — anonymous-looking 401
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json(session);
  }),

  http.get("*/api/users", ({ request }) => {
    const { page, size } = parsePage(new URL(request.url));
    return HttpResponse.json(listUsersPage(page, size));
  }),

  http.post("*/api/users", async ({ request }) => {
    const body = (await request.json()) as CreateUserRequest;
    if (!body?.username?.trim() || !body?.password) {
      return HttpResponse.json(
        {
          error: "Validation failed",
          details: { username: "Required", password: "Required" },
        },
        { status: 400 }
      );
    }
    if (findUserByUsername(body.username.trim())) {
      return HttpResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }
    const user = createUser({
      ...body,
      username: body.username.trim(),
    });
    return HttpResponse.json(user);
  }),
];
