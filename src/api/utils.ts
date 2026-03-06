// src/api/utils.ts
import { HTTPError } from 'ky';

export async function handleApiCall<T>(promise: Promise<T>): Promise<[T | null, string | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorData = await error.response.json().catch(() => ({}));
      return [null, errorData.message || `Error: ${error.response.statusText}`];
    }
    return [null, (error as Error).message || 'An unexpected error occurred'];
  }
}