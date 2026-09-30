import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE = "vl_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;
const ID_PATTERN = /^[a-z0-9]{20,40}$/;

/**
 * Anonymous visitor identity for saved lists. No login: a random ID in an
 * httpOnly cookie maps to a `User` row. Real auth can replace this later.
 */
export async function getVisitorId({ create }: { create: boolean }): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing && ID_PATTERN.test(existing)) {
    const user = await db().user.findUnique({ where: { id: existing }, select: { id: true } });
    if (user) {
      // Throttle lastSeenAt writes to reads that also create/modify data
      if (create) await db().user.update({ where: { id: existing }, data: { lastSeenAt: new Date() } });
      return user.id;
    }
  }
  if (!create) return null;
  const user = await db().user.create({ data: {} });
  jar.set(COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return user.id;
}
