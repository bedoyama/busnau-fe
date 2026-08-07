import { http } from "msw";
import { getBusnauApiMock } from "@/lib/mocks/generated/endpoints.msw";

/**
 * MSW handler list used by browser + Node workers.
 * Orval regenerates `generated/endpoints.msw.ts`; keep custom handlers here.
 */
export const handlers = [
  http.get("*/api/health", () => {
    return new Response(JSON.stringify({ status: "ok", mocked: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
  ...getBusnauApiMock(),
];
