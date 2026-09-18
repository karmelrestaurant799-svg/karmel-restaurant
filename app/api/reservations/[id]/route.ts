import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { readJson, badRequest } from "@/lib/http";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

// Only these two fields are editable from the admin table. Validating them
// turns a bad value (e.g. status "FOO") into a 400 instead of a Prisma 500.
// `undefined` leaves a field untouched; `tableNumber: null` clears it (the
// admin UI sends null when the Table # input is emptied).
const patchSchema = z.object({
  tableNumber: z.number().int().min(0).max(1000).nullable().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
});

function isNotFound(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const body = await readJson(req);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return badRequest();

  try {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        tableNumber: parsed.data.tableNumber,
        status: parsed.data.status,
      },
    });
    return NextResponse.json({ reservation });
  } catch (err) {
    if (isNotFound(err)) return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  try {
    await prisma.reservation.delete({ where: { id } });
  } catch (err) {
    if (isNotFound(err)) return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
    throw err;
  }
  return NextResponse.json({ ok: true });
}
