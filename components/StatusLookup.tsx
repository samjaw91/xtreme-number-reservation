"use client";

import { useState } from "react";
import { fmtDate } from "@/lib/format";

const labels: Record<string, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  rejected: "مرفوض",
  expired: "منتهي",
  cancelled: "ملغي",
};

export function StatusLookup() {
  const [requestCode, setRequestCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const params = new URLSearchParams();
      if (requestCode) params.set("requestCode", requestCode);
      if (phone) params.set("phone", phone);
      const res = await fetch(`/api/public/status?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر تحميل الحالة");
      setResult(data.data);
      if (!data.data) setError("لم يتم العثور على طلب مطابق");
    } catch (err: any) {
      setError(err.message || "تعذر تحميل الحالة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form-card status-box">
      <h2>تتبّع حالة الطلب</h2>
      <form onSubmit={lookup}>
        <label>
          رقم الطلب
          <input value={requestCode} onChange={(e) => setRequestCode(e.target.value)} placeholder="مثال: REQ-AB12CD34" />
        </label>
        <div className="center muted">أو</div>
        <label>
          رقم الهاتف
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="مثال: 03xxxxxx" />
        </label>
        {error ? <div className="alert error">{error}</div> : null}
        <button className="primary-btn" disabled={loading}>{loading ? "جاري البحث..." : "عرض الحالة"}</button>
      </form>

      {result ? (
        <div className="result-card">
          <div><strong>رقم الطلب:</strong> {result.request_code}</div>
          <div><strong>الاسم:</strong> {result.participants?.full_name || "-"}</div>
          <div><strong>الحالة:</strong> {labels[result.status] || result.status}</div>
          <div><strong>الأرقام:</strong> {(result.items || []).map((i: any) => i.number_value).join("، ")}</div>
          <div><strong>تاريخ الإرسال:</strong> {fmtDate(result.submitted_at)}</div>
          <div><strong>تنتهي المهلة:</strong> {fmtDate(result.expires_at)}</div>
          {result.admin_notes ? <div><strong>ملاحظات الإدارة:</strong> {result.admin_notes}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
