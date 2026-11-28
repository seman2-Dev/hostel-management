import { config } from "@/config";

/** Standard API envelope returned by the server. */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: unknown;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function csrfToken(): string | null {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("hms_csrf="))
    ?.split("=")[1] ?? null;
}

/**
 * Foundation API client for Phase 02. It always sends credentials, sets the
 * JSON content type and echoes the CSRF token for cookie-authenticated mutations.
 */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = csrfToken();
  if (token && !["GET", "HEAD", "OPTIONS"].includes(method)) headers.set("X-CSRF-Token", token);

  const response = await fetch(`${config.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    method,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let code: string | undefined;
    try {
      const body = (await response.json()) as Partial<ApiEnvelope<unknown>> & { code?: string };
      message = body.message ?? body.code ?? message;
      code = body.code;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiRequestError(message, response.status, code);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
