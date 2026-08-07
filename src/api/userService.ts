import { api } from "./client";
import { handleApiCall } from "./utils";
import type { ChangePasswordRequest } from "@/lib/model/changePasswordRequest";
import type { CreateUserRequest } from "@/lib/model/createUserRequest";
import type { GetAllUsersParams } from "@/lib/model/getAllUsersParams";
import type { PageUser } from "@/lib/model/pageUser";
import type { User } from "@/lib/model/user";

function toSearchParams(
  params?: GetAllUsersParams
): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number> = {};
  if (params.page !== undefined) out.page = params.page;
  if (params.size !== undefined) out.size = params.size;
  if (params.sort !== undefined) {
    // Spring accepts repeated sort=; ky serializes arrays as multi values
    // For a single sort string, pass as-is
    const sort = params.sort;
    if (Array.isArray(sort)) {
      // join later via searchParams object — use first for simple case
      if (sort.length > 0) out.sort = sort[0] as string;
    } else {
      out.sort = sort as string;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export const userService = {
  /**
   * ADMIN: paged list of users (Spring `Page<User>`).
   * Default API page size is 20 when params omitted.
   */
  getAllUsers: (params?: GetAllUsersParams) =>
    handleApiCall(
      api
        .get("api/users", { searchParams: toSearchParams(params) })
        .json<PageUser>()
    ),

  getCurrentUser: () =>
    handleApiCall(api.get("api/users/me").json<User>()),

  changePassword: (body: ChangePasswordRequest) =>
    handleApiCall(
      api
        .post("api/users/me/password", { json: body })
        .then(() => undefined as void)
    ),

  /** ADMIN create (or public register without role). */
  createUser: (body: CreateUserRequest) =>
    handleApiCall(api.post("api/users", { json: body }).json<User>()),
};
