import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { listReservations } from "@/lib/repository";
import { AdminReservations } from "@/components/AdminReservations";

export default async function AdminReservationsPage() {
  const ok = await requireAdmin();
  if (!ok) redirect("/admin/login");
  const rows = await listReservations();
  return <AdminReservations initialRows={rows} />;
}
