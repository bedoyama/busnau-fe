import { faker } from "@faker-js/faker";

/**
 * Orval codegen for busnau-api.
 *
 * Canonical outputs (single source of truth — do not use top-level `lib/`):
 * - Models:  src/lib/model/*
 * - Client:  src/lib/mocks/endpoints.ts (split mode; we use ky elsewhere for now)
 * - MSW:     src/lib/mocks/endpoints.msw.ts
 *
 * Refresh OpenAPI, then regenerate:
 *   pnpm generate:api
 *
 * See docs/LOCAL.md.
 */
module.exports = {
  "busnau-api": {
    input: "./openapi/swagger.json",
    output: {
      mode: "split",
      target: "./src/lib/mocks/endpoints.ts",
      schemas: "./src/lib/model",
      client: "fetch",
      mock: true,
      clean: true,
      override: {
        mock: {
          properties: {
            "/id$/": () => faker.number.int({ min: 1, max: 1_000_000 }),
            "/userId$/": () => faker.number.int({ min: 1, max: 1_000 }),
            "/totalElements$/": () => faker.number.int({ min: 0, max: 50 }),
            "/totalPages$/": () => faker.number.int({ min: 0, max: 5 }),
            "/numberOfElements$/": () => faker.number.int({ min: 0, max: 20 }),
            "/size$/": () => 20,
            "/number$/": () => 0,
          },
          stringMin: 4,
          stringMax: 32,
          delay: () => faker.number.int({ min: 50, max: 300 }),
          delayFunctionLazyExecute: true,
        },
      },
    },
  },
};
