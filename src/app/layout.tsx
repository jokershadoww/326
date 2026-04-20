import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "إدارة سيرفر انتقام السلاطين",
  description: "لوحة تحكم إدارة سيرفر لعبة انتقام السلاطين",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.className} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
