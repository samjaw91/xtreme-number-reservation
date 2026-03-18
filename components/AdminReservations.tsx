"use client";

import { fmtDate } from "@/lib/format";
import { useState } from "react";

const labels: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  rejected: "مرفوض",
  expired: "منتهي",
  cancelled: "ملغي",
};

export function AdminReservations({ initialRows }: { initialRows: any[] }) {
  const [rows, setRows] = useState(initialRows);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  async function refresh(status = filter) {
    const res = await fetch(`/api/admin/reservations${status !== "all" ? `?status=${status}` : ""}`);
    const data = await res.json();
    if (res.ok) setRows(data.rows || []);
  }

  async function act(id: string, action: "approve" | "reject" | "expire") {
    const note = window.prompt("ملاحظة إدارية (اختياري):", "") || "";
    setBusyId(id);
    const res = await fetch(`/api/admin/reservations/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: note }),
    });
    setBusyId(null);
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "تعذرت العملية");
      return;
    }
    refresh();
  }

  return (
    <div className="card">
      <div className="toolbar">
        <h2>إدارة الطلبات</h2>
        <div>
          <select value={filter} onChange={(e) => { setFilter(e.target.value); refresh(e.target.value); }}>
            <option value="all">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="confirmed">مؤكد</option>
            <option value="rejected">مرفوض</option>
            <option value="expired">منتهي</option>
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>الأرقام</th>
              <th>الحالة</th>
              <th>الإرسال</th>
              <th>المهلة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.request_code}</td>
                <td>{row.participants?.full_name || "-"}</td>
                <td>{row.participants?.phone_number || "-"}</td>
                <td>{(row.numbers || []).join("، ")}</td>
                <td><span className={`badge badge-${row.status}`}>{labels[row.status] || row.status}</span></td>
                <td>{fmtDate(row.submitted_at)}</td>
                <td>{fmtDate(row.expires_at)}</td>
                <td>
                  <div className="actions">
                    <button disabled={busyId === row.id || row.status !== "pending"} onClick={() => act(row.id, "approve")}>تأكيد</button>
                    <button disabled={busyId === row.id || row.status !== "pending"} onClick={() => act(row.id, "reject")}>رفض</button>
                    <button disabled={busyId === row.id || row.status !== "pending"} onClick={() => act(row.id, "expire")}>إنهاء</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
