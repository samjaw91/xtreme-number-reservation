import Link from "next/link";
import { PublicLayout } from "@/components/PublicLayout";
import { getDashboardStats } from "@/lib/repository";

export default async function HomePage() {
  let data: any = null;
  try {
    data = await getDashboardStats();
  } catch {}
  return (
    <PublicLayout>
      <section className="hero">
        <h1>احجز رقمك بسهولة وابدأ مشاركتك خلال دقائق</h1>
        <p>
          اختر الرقم المناسب لك من بين الأرقام المتاحة، أدخل اسمك ورقم هاتفك، ثم أرسل الطلب ليتم مراجعته وتأكيده من قبل الإدارة.
          المنصة مصممة بالعربية، سريعة على الهاتف، وسهلة الإدارة من لوحة التحكم.
        </p>
        <div className="hero-actions">
          <Link className="primary-btn" href="/reserve">ابدأ الحجز الآن</Link>
          <Link className="secondary-btn" href="/status">تتبّع حالة الطلب</Link>
        </div>
      </section>

      {data ? (
        <section className="stats-row">
          <div className="stat-box"><div>الأرقام المتاحة</div><strong>{data.stats.available}</strong></div>
          <div className="stat-box"><div>قيد المراجعة</div><strong>{data.stats.pending}</strong></div>
          <div className="stat-box"><div>المؤكدة</div><strong>{data.stats.confirmed}</strong></div>
          <div className="stat-box"><div>الحملة الحالية</div><strong style={{fontSize:20}}>{data.campaign.title_ar}</strong></div>
        </section>
      ) : null}

      <section className="card">
        <h2>كيف تعمل المنصة؟</h2>
        <ol>
          <li>اختر رقماً أو أكثر من الأرقام المتاحة.</li>
          <li>أدخل الاسم الكامل ورقم الهاتف.</li>
          <li>أرسل الطلب لتحويل الأرقام إلى حالة قيد المراجعة.</li>
          <li>تقوم الإدارة بمراجعة الدفع يدوياً.</li>
          <li>عند الموافقة تصبح الأرقام مؤكدة، وإذا انتهت المهلة تعود متاحة.</li>
        </ol>
      </section>
    </PublicLayout>
  );
}
