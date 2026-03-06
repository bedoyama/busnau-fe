import { faker } from "@faker-js/faker";

module.exports = {
  'busnau-api': {
    input: './openapi/swagger.json',
    output: {
      mode: 'split',
      target: './openapi/generated/endpoints.ts',
      schemas: './openapi/generated/model',
      client: 'fetch',
      mock: true,
      override: {
        mock: {
          properties: {
            '/id$/': () => faker.number.int({min: 1, max: 1000000}),  // always a positive int
            // Or more specific if multiple ids (e.g. userId)
            // '/(user|User)Id$/': () => faker.number.int({ min: 1000, max: 999999 }),
          },
          stringMin: 8,
          stringMax: 32,
          delay: () => faker.number.int({min: 200, max: 800}), // random latency per request
          delayFunctionLazyExecute: true, // execute delay function on each request, not just once at startup
        },
      },
    },
  },
};