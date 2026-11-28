/**
 * Public runtime configuration. Only NEXT_PUBLIC_* values are safe here.
 * The mock flag keeps Phase 01 working; Phase 02 will flip it to use the API.
 */
export const config = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api").replace(/\/$/, ""),
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API !== "false",
} as const;
