import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isMockMode } from "@/lib/youtube/client";
import { YouTubeError, messages } from "@/lib/youtube/errors";
import type { ApiEnvelope, ApiErrorBody } from "@/lib/youtube/types";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit & { cacheSeconds?: number }): NextResponse<ApiEnvelope<T>> {
  const headers = new Headers(init?.headers);
  if (init?.cacheSeconds) {
    headers.set("Cache-Control", `public, s-maxage=${init.cacheSeconds}, stale-while-revalidate=${init.cacheSeconds * 2}`);
  } else {
    headers.set("Cache-Control", "no-store");
  }
  return NextResponse.json(
    { data, source: isMockMode() ? "mock" : "youtube", fetchedAt: new Date().toISOString() },
    { ...init, headers },
  );
}

function errorResponse(status: number, code: string, message: string): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Wrap a route handler: maps known errors to friendly JSON, hides internals. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof YouTubeError) return errorResponse(err.status, err.code, err.message);
    if (err instanceof ApiError) return errorResponse(err.status, err.code, err.message);
    if (err instanceof z.ZodError) {
      const first = err.issues[0];
      return errorResponse(400, "INVALID_INPUT", first?.message ?? "Invalid request.");
    }
    console.error("[api] unhandled error", err);
    return errorResponse(500, "INTERNAL", "Something went wrong on our side. Please try again.");
  }
}

/** Throws a 429 ApiError when the caller exceeds `limit` requests per `windowMs`. */
export function enforceRateLimit(req: Request, bucket: string, limit: number, windowMs = 60_000): void {
  const res = rateLimit(`${bucket}:${clientIp(req.headers)}`, limit, windowMs);
  if (!res.ok) throw new ApiError(429, "RATE_LIMITED", messages.rateLimited);
}

export async function parseJson<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "INVALID_INPUT", "Request body must be valid JSON.");
  }
  return schema.parse(body);
}

export function parseQuery<T extends z.ZodType>(req: Request, schema: T): z.infer<T> {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  return schema.parse(params);
}
