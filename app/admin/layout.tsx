import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">لوحة الإدارة</div>
        <nav className="admin-nav">
          <Link href="/admin/dashboard">الرئيسية</Link>
          <Link href="/admin/reservations">الطلبات</Link>
          <Link href="/admin/settings">الإعدادات</Link>
          <Link href="/">عرض الموقع</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
