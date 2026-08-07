import { http } from "msw";
import { getBusnauApiMock } from "@/lib/mocks/generated/endpoints.msw";
import { taskHandlers } from "@/lib/mocks/taskHandlers";

/**
 * MSW handler list used by browser + Node workers.
 * Custom handlers first (first match wins). Orval covers the rest (auth, users, …).
 */
export const handlers = [
  http.get("*/api/health", () => {
    return new Response(JSON.stringify({ status: "ok", mocked: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
  ...taskHandlers,
  ...getBusnauApiMock(),
];
