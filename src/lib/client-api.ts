/** Browser-side fetch helpers for our own API routes. */
import type { ApiEnvelope, ApiErrorBody, DataSource } from "@/lib/youtube/types";

export class ClientApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<{ data: T; source: DataSource; fetchedAt: string }> {
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  } catch {
    throw new ClientApiError("NETWORK", "We couldn't reach the server. Check your connection and try again.", 0);
  }
  let body: ApiEnvelope<T> | ApiErrorBody | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T> | ApiErrorBody;
  } catch {
    // fall through
  }
  if (!res.ok || !body || "error" in body) {
    const err = body && "error" in body ? body.error : null;
    throw new ClientApiError(err?.code ?? "UNKNOWN", err?.message ?? "Something went wrong. Please try again.", res.status);
  }
  return body;
}

export const apiGet = <T>(url: string) => request<T>(url);
export const apiPost = <T>(url: string, body: unknown) => request<T>(url, { method: "POST", body: JSON.stringify(body) });
export const apiDelete = <T>(url: string) => request<T>(url, { method: "DELETE" });

export function errorMessage(err: unknown): string {
  return err instanceof ClientApiError ? err.message : "Something went wrong. Please try again.";
}

export function errorTitle(err: unknown): string {
  if (!(err instanceof ClientApiError)) return "Something went wrong";
  switch (err.code) {
    case "NOT_FOUND":
      return "Not found";
    case "INVALID_INPUT":
      return "Check your input";
    case "QUOTA_EXCEEDED":
      return "Daily YouTube quota reached";
    case "RATE_LIMITED":
      return "Slow down a little";
    case "NOT_CONFIGURED":
    case "DB_NOT_CONFIGURED":
      return "Not configured";
    case "COMMENTS_DISABLED":
      return "Comments are disabled";
    case "NETWORK":
      return "Connection problem";
    default:
      return "Something went wrong";
  }
}
