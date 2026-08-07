import { HTTPError } from "ky";
import type { ApiError } from "@/lib/model/apiError";

/**
 * Run an API promise and return a tuple: [data, errorMessage].
 * Maps busnau-api error bodies `{ error, details }` (not `message`).
 */
export async function handleApiCall<T>(
  promise: Promise<T>
): Promise<[T | null, string | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    if (error instanceof HTTPError) {
      return [null, await messageFromHttpError(error)];
    }
    return [null, (error as Error).message || "An unexpected error occurred"];
  }
}

export async function messageFromHttpError(error: HTTPError): Promise<string> {
  const status = error.response.status;
  const body = (await error.response.json().catch(() => null)) as ApiError | null;

  if (body && typeof body === "object") {
    const base =
      typeof body.error === "string" && body.error.trim()
        ? body.error
        : `Error: ${error.response.statusText || status}`;

    if (body.details && typeof body.details === "object") {
      const fields = Object.entries(body.details)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join("; ");
      if (fields) return `${base} (${fields})`;
    }
    return base;
  }

  return `Error: ${error.response.statusText || status}`;
}
