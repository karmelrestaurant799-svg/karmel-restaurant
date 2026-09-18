import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { title, subtitle, slug, isMainCategory, parentId } = await req.json();
  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });

  const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  
  let order = 0;
  if (isMainCategory) {
    order = await prisma.menuCategory.count({ where: { isMainCategory: true } });
  } else if (parentId) {
    order = await prisma.menuCategory.count({ where: { parentId } });
  }

  const category = await prisma.menuCategory.create({
    data: { 
      title, 
      subtitle: subtitle || "", 
      slug: finalSlug, 
      order, 
      isMainCategory: isMainCategory || false,
      parentId: parentId || null,
    },
  });
  return NextResponse.json({ category });
}