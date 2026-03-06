import ky from 'ky';

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  // 1. Timeout: Don't let requests hang forever (important for mobile/slow Wi-Fi)
  timeout: 10000,

  // 2. Retry Logic: Automatically retry on 5xx errors or network failures
  retry: {
    limit: 2,
    methods: ['get', 'put', 'delete'], // Don't retry POST by default (prevents duplicate creates)
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 3000
  },

  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem('token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      // 3. Global Error Handling: Handle 401s (expired tokens) globally
      async (_request, _options, response) => {
        if (response.status === 401) {
          console.error('Session expired, redirecting to login...');
          // Optional: localStorage.removeItem('token'); window.location.href = '/login';
        }
      }
    ]
  },
});