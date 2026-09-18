import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import NewReservationAlert from "@/components/admin/NewReservationAlert";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200">
      <AdminHeader />
      <div className="px-6 md:px-16 py-12">{children}</div>
      <NewReservationAlert />
    </div>
  );
}