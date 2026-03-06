module.exports = {
  'busnau-api': {
    input: './openapi/swagger.json',
    output: {
      mode: 'split', // Generates separate files for models, endpoints, and mocks
      target: './src/api/generated/endpoints.ts',
      schemas: './src/api/generated/model',
      client: 'axios', // Best for generating clean models and mock signatures
      mock: {
        stringMin: 5,
        stringMax: 200,
      },
    },
  },
};