import Link from "next/link";
import { PublicLayout } from "@/components/PublicLayout";

export default async function ReserveSuccessPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const params = await searchParams;
  return (
    <PublicLayout>
      <section className="card center">
        <h1>تم استلام طلبك بنجاح</h1>
        <p className="muted">طلبك الآن قيد المراجعة من قبل الإدارة.</p>
        <p>رقم الطلب:</p>
        <div className="code-box">{params.code || "-"}</div>
        <p className="muted" style={{marginTop:16}}>يرجى الاحتفاظ برقم الطلب لاستخدامه لاحقاً في صفحة تتبّع الحالة.</p>
        <div className="hero-actions" style={{justifyContent:'center'}}>
          <Link className="primary-btn" href="/status">تتبّع الطلب</Link>
          <Link className="secondary-btn" href="/">العودة للرئيسية</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
