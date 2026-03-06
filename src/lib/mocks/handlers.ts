import { http } from "msw";
import { getOpenAPIDefinitionMock } from '@/lib/mocks/endpoints.msw';

// Placeholder — replace with your real endpoints
export const handlers = [
  // Example placeholder
  http.get("*/api/health", () => {
    return new Response(JSON.stringify({ status: "ok", mocked: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),

  // ... your future Postman-based handlers go here
    ...getOpenAPIDefinitionMock(),
];