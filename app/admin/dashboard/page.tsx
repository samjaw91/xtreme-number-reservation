import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDashboardStats, listReservations } from "@/lib/repository";

export default async function AdminDashboardPage() {
  const ok = await requireAdmin();
  if (!ok) redirect("/admin/login");
  const data = await getDashboardStats();
  const reservations = await listReservations("pending");
  return (
    <div>
      <section className="stats-row">
        <div className="stat-box"><div>متاح</div><strong>{data?.stats.available ?? 0}</strong></div>
        <div className="stat-box"><div>قيد المراجعة</div><strong>{data?.stats.pending ?? 0}</strong></div>
        <div className="stat-box"><div>مؤكد</div><strong>{data?.stats.confirmed ?? 0}</strong></div>
        <div className="stat-box"><div>الحملة</div><strong style={{ fontSize: 20 }}>{data?.campaign?.title_ar ?? "-"}</strong></div>
      </section>
      <section className="card">
        <h2>آخر الطلبات المعلّقة</h2>
        <ul>
          {reservations.slice(0, 10).map((row) => (
            <li key={row.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              {row.request_code} — {row.participants?.[0]?.full_name ?? 'بدون اسم'} — ... — {(row.numbers || []).join("، ")}
            </li>
          ))}
          {!reservations.length ? <li>لا توجد طلبات معلقة حالياً.</li> : null}
        </ul>
      </section>
    </div>
  );
}
