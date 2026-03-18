import Link from "next/link";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">منصّة الحجز الذكي</div>
        <nav className="nav">
          <Link href="/">الرئيسية</Link>
          <Link href="/reserve">الحجز</Link>
          <Link href="/status">تتبّع الطلب</Link>
          <Link href="/admin/login">الإدارة</Link>
        </nav>
      </header>
      {children}
      <footer className="footer">
        <p>منصّة احترافية لإدارة حجوزات الأرقام ومراجعة الطلبات من قبل الإدارة.</p>
        <p>يرجى مراجعة القوانين والأنظمة المحلية قبل إطلاق أي حملة مدفوعة أو تتضمن جوائز أو عناصر قائمة على الحظ.</p>
      </footer>
    </div>
  );
}
