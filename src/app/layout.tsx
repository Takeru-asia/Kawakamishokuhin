import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "川上食品 HACCP管理システム",
  description: "HACCP管理システム - 川上食品",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
