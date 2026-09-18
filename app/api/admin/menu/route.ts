import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const categories = await prisma.menuCategory.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json({ categories });
}

const itemSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1),
  desc: z.string().optional(),
  price: z.string().min(1),
  star: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const count = await prisma.menuItem.count({ where: { categoryId: parsed.data.categoryId } });
  const item = await prisma.menuItem.create({
    data: { ...parsed.data, desc: parsed.data.desc || null, order: count },
  });
  return NextResponse.json({ item });
}