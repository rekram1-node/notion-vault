import { type Result, ok, error } from "~/server/types/result";

export async function api<T>(
  url: string,
  options: RequestInit,
): Promise<Result<T>> {
  try {
    return fetch(url, options).then(async (response) => {
      if (!response.ok) {
        const err = new Error(
          `Status: ${response.status} Response: ${await response.text()}`,
        );
        return error(err);
      }
      const jsonData = (await response.json()) as T;
      return ok(jsonData);
    });
  } catch (e) {
    const err = new Error(`failed to process request: ${String(e)}`);
    return error(err);
  }
}
