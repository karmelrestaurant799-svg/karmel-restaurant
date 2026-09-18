import { prisma } from "@/lib/prisma";
import MenuEditor from "./MenuEditor";

export default async function AdminMenuPage() {
  const mainCategories = await prisma.menuCategory.findMany({
    where: { isMainCategory: true },
    orderBy: { order: "asc" },
    include: {
      children: {
        where: { isMainCategory: false },
        orderBy: { order: "asc" },
        include: { items: { orderBy: { order: "asc" } } },
      },
    },
  });

  return (
    <>
      <h1 className="text-4xl text-white mb-10">Menu</h1>
      <MenuEditor initial={JSON.parse(JSON.stringify(mainCategories))} />
    </>
  );
}