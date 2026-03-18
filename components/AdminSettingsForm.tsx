"use client";

import { useState } from "react";

export function AdminSettingsForm({ bundle }: { bundle: any }) {
  const [form, setForm] = useState({
    campaignTitleAr: bundle?.campaign?.title_ar || "",
    campaignDescriptionAr: bundle?.campaign?.description_ar || "",
    instructionsAr: bundle?.campaign?.instructions_ar || "",
    campaignStatus: bundle?.campaign?.status || "open",
    maxNumbersPerUser: bundle?.campaign?.max_numbers_per_user || 1,
    pendingTimeoutMinutes: bundle?.campaign?.pending_timeout_minutes || 60,
    siteNameAr: bundle?.settings?.site_name_ar || "منصّة الحجز الذكي",
    legalNoticeAr: bundle?.settings?.legal_notice_ar || "",
    supportPhone: bundle?.settings?.support_phone || "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    setMsg(res.ok ? "تم حفظ الإعدادات بنجاح" : (data.error || "تعذر حفظ الإعدادات"));
  }

  return (
    <form className="card form-card" onSubmit={save}>
      <h2>إعدادات الحملة والمنصة</h2>
      <label>عنوان الحملة<input value={form.campaignTitleAr} onChange={(e) => setForm({ ...form, campaignTitleAr: e.target.value })} /></label>
      <label>وصف قصير<textarea value={form.campaignDescriptionAr} onChange={(e) => setForm({ ...form, campaignDescriptionAr: e.target.value })} /></label>
      <label>تعليمات المشاركة<textarea value={form.instructionsAr} onChange={(e) => setForm({ ...form, instructionsAr: e.target.value })} /></label>
      <label>حالة الحملة
        <select value={form.campaignStatus} onChange={(e) => setForm({ ...form, campaignStatus: e.target.value })}>
          <option value="open">مفتوحة</option>
          <option value="closed">مغلقة</option>
          <option value="draft">مسودة</option>
        </select>
      </label>
      <label>الحد الأقصى للأرقام لكل مستخدم<input type="number" value={form.maxNumbersPerUser} onChange={(e) => setForm({ ...form, maxNumbersPerUser: Number(e.target.value) })} /></label>
      <label>مدة الحجز المعلّق بالدقائق<input type="number" value={form.pendingTimeoutMinutes} onChange={(e) => setForm({ ...form, pendingTimeoutMinutes: Number(e.target.value) })} /></label>
      <label>اسم المنصة<input value={form.siteNameAr} onChange={(e) => setForm({ ...form, siteNameAr: e.target.value })} /></label>
      <label>رقم الدعم<input value={form.supportPhone} onChange={(e) => setForm({ ...form, supportPhone: e.target.value })} /></label>
      <label>الملاحظة القانونية<textarea value={form.legalNoticeAr} onChange={(e) => setForm({ ...form, legalNoticeAr: e.target.value })} /></label>
      {msg ? <div className="alert success">{msg}</div> : null}
      <button className="primary-btn" disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ الإعدادات"}</button>
    </form>
  );
}
