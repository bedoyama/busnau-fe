import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

worker.start({
  onUnhandledRequest: 'bypass', // Don't let MSW stall on internal Next.js requests
  waitUntilReady: true,        // Ensures the worker is active before the app fetches
}).catch(console.error)