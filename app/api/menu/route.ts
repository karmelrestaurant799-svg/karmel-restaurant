import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const mainCategories = await prisma.menuCategory.findMany({
    where: { isMainCategory: true },
    orderBy: { order: "asc" },
    include: {
      children: {
        where: { isMainCategory: false },
        orderBy: { order: "asc" },
        include: {
          items: { where: { available: true }, orderBy: { order: "asc" } },
        },
      },
    },
  });
  return NextResponse.json({ mainCategories });
}