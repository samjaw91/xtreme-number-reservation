import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getSettingsBundle } from "@/lib/repository";
import { AdminSettingsForm } from "@/components/AdminSettingsForm";

export default async function AdminSettingsPage() {
  const ok = await requireAdmin();
  if (!ok) redirect("/admin/login");
  const bundle = await getSettingsBundle();
  return <AdminSettingsForm bundle={bundle} />;
}
