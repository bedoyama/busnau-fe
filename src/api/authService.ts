import { api } from "./client";
import { handleApiCall } from "./utils";
import type { CreateUserRequest } from "@/lib/model/createUserRequest";
import type { LoginRequest } from "@/lib/model/loginRequest";
import type { LoginResponse } from "@/lib/model/loginResponse";
import type { User } from "@/lib/model/user";

export const authService = {
  login: (body: LoginRequest) =>
    handleApiCall(
      api.post("api/auth/login", { json: body }).json<LoginResponse>()
    ),

  /** Public registration (API forces USER role when unauthenticated). */
  register: (body: CreateUserRequest) =>
    handleApiCall(api.post("api/users", { json: body }).json<User>()),
};
