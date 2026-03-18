import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "منصّة الحجز الذكي",
  description: "منصة عربية لإدارة حجز الأرقام ومراجعة الطلبات من قبل الإدارة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
