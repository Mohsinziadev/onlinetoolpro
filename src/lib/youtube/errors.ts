export type YouTubeErrorCode =
  | "NOT_CONFIGURED"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "COMMENTS_DISABLED"
  | "FORBIDDEN"
  | "UPSTREAM";

const STATUS: Record<YouTubeErrorCode, number> = {
  NOT_CONFIGURED: 503,
  INVALID_INPUT: 400,
  NOT_FOUND: 404,
  QUOTA_EXCEEDED: 503,
  RATE_LIMITED: 429,
  COMMENTS_DISABLED: 422,
  FORBIDDEN: 403,
  UPSTREAM: 502,
};

/** Errors carrying a user-safe message. Never include API keys or raw upstream bodies. */
export class YouTubeError extends Error {
  readonly code: YouTubeErrorCode;
  readonly status: number;
  constructor(code: YouTubeErrorCode, message: string) {
    super(message);
    this.name = "YouTubeError";
    this.code = code;
    this.status = STATUS[code];
  }
}

export const messages = {
  notConfigured:
    "YouTube data isn't available because the YouTube API key hasn't been configured on this server.",
  quota:
    "We've reached today's YouTube API quota. Quotas reset at midnight Pacific Time — please try again later.",
  upstream: "YouTube's API didn't respond as expected. Please try again in a moment.",
  rateLimited: "You're making requests too quickly. Please wait a few seconds and try again.",
} as const;
