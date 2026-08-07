import { api } from "./client";
import { handleApiCall } from "./utils";
import type { CreateUserRequest } from "@/lib/model/createUserRequest";
import type { LoginRequest } from "@/lib/model/loginRequest";
import type { LoginResponse } from "@/lib/model/loginResponse";
import type { LogoutRequest } from "@/lib/model/logoutRequest";
import type { User } from "@/lib/model/user";

export const authService = {
  login: (body: LoginRequest) =>
    handleApiCall(
      api.post("api/auth/login", { json: body }).json<LoginResponse>()
    ),

  /** Public registration (API forces USER role when unauthenticated). */
  register: (body: CreateUserRequest) =>
    handleApiCall(api.post("api/users", { json: body }).json<User>()),

  logout: (body: LogoutRequest) =>
    handleApiCall(
      api.post("api/auth/logout", { json: body }).then(() => undefined as void)
    ),

  /** Revoke every refresh token for the authenticated user (Bearer required). */
  logoutAll: () =>
    handleApiCall(
      api.post("api/auth/logout-all").then(() => undefined as void)
    ),
};
