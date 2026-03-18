"use client";

import { useMemo, useState } from "react";
import { NumberGrid } from "@/components/NumberGrid";
import { ActiveCampaign, CampaignNumber } from "@/lib/types";
import { useRouter } from "next/navigation";

export function ReserveForm({ campaign, numbers }: { campaign: ActiveCampaign; numbers: CampaignNumber[] }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const selectedLabel = useMemo(() => selected.sort((a, b) => a - b).join("، "), [selected]);

  function onToggle(num: number) {
    setError("");
    setSelected((prev) => {
      if (prev.includes(num)) return prev.filter((n) => n !== num);
      if (prev.length >= campaign.max_numbers_per_user) {
        setError(`الحد الأقصى المسموح هو ${campaign.max_numbers_per_user} رقم`);
        return prev;
      }
      return [...prev, num];
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, numbers: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ غير متوقع");
      router.push(`/reserve/success?code=${data.requestCode}`);
    } catch (err: any) {
      setError(err.message || "تعذر إرسال الطلب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="two-col">
      <div className="card">
        <div className="legend-row">
          <span className="pill pill-available">متاح</span>
          <span className="pill pill-pending">قيد المراجعة</span>
          <span className="pill pill-confirmed">مؤكد</span>
        </div>
        <NumberGrid numbers={numbers} selected={selected} onToggle={onToggle} />
      </div>

      <form className="card form-card" onSubmit={onSubmit}>
        <h2>بيانات الحجز</h2>
        <p className="muted">اختر الأرقام المتاحة ثم أدخل اسمك الكامل ورقم هاتفك.</p>

        <label>
          الاسم الكامل
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={3} />
        </label>

        <label>
          رقم الهاتف
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={7} />
        </label>

        <div className="summary-box">
          <div>الأرقام المختارة</div>
          <strong>{selectedLabel || "لا يوجد اختيار بعد"}</strong>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        <button className="primary-btn" disabled={loading || selected.length === 0}>
          {loading ? "جاري إرسال الطلب..." : "إرسال الطلب"}
        </button>

        <div className="small-note">
          بعد الإرسال ستتحول الأرقام إلى <strong>قيد المراجعة</strong> إلى أن يتم التحقق من الدفع من قبل الإدارة.
        </div>
      </form>
    </div>
  );
}
