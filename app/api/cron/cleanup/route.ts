import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/hash";

// GDPR storage-limitation cleanup (Art. 5(1)(e)): purges unverified accounts
// that never completed email verification, and reservation records past
// their retention window. Triggered by Vercel Cron (see vercel.json) or
// manually with the CRON_SECRET bearer token.
// `Number("")` is 0 and `Number("abc")` is NaN, and `??` doesn't catch either:
// a blank/typo'd env var would silently become a 0-day retention window and
// delete every unverified user / every past reservation (or throw on NaN).
// Anything that isn't a positive number falls back to the documented default.
function positiveNumber(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return raw?.trim() && Number.isFinite(n) && n > 0 ? n : fallback;
}

const UNVERIFIED_ACCOUNT_RETENTION_DAYS = positiveNumber(
  process.env.UNVERIFIED_ACCOUNT_RETENTION_DAYS,
  7
);
const RESERVATION_RETENTION_MONTHS = positiveNumber(
  process.env.RESERVATION_RETENTION_MONTHS,
  24
);

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // Constant-time compare (hash both sides so the buffers are equal length).
  const provided = Buffer.from(sha256(req.headers.get("authorization") ?? ""));
  const expected = Buffer.from(sha256(`Bearer ${secret}`));
  return timingSafeEqual(provided, expected);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unverifiedCutoff = new Date();
  unverifiedCutoff.setDate(unverifiedCutoff.getDate() - UNVERIFIED_ACCOUNT_RETENTION_DAYS);

  const reservationCutoff = new Date();
  reservationCutoff.setMonth(reservationCutoff.getMonth() - RESERVATION_RETENTION_MONTHS);

  const [deletedUsers, deletedReservations] = await Promise.all([
    prisma.user.deleteMany({
      where: {
        emailVerified: null,
        createdAt: { lt: unverifiedCutoff },
        // Never purge an admin, or anyone who signed up via Google/Facebook
        // (provider-verified; older rows may predate the linkAccount fix in
        // lib/auth.ts and still have emailVerified unset).
        role: "USER",
        accounts: { none: {} },
      },
    }),
    prisma.reservation.deleteMany({
      where: { date: { lt: reservationCutoff } },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    deletedUnverifiedUsers: deletedUsers.count,
    deletedOldReservations: deletedReservations.count,
  });
}
