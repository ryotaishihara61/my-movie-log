// app/layout.tsx

import type { Metadata } from 'next';
// ▼▼▼▼▼ 読み込むフォントを 'Inter' に変更します ▼▼▼▼▼
import { Inter } from 'next/font/google';
import './globals.css';

// ▼▼▼▼▼ フォントの設定を 'Inter' に変更します ▼▼▼▼▼
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | My Movie Log',
    default: 'My Movie Log',
  },
  description: 'あなただけの映画鑑賞記録・データベース',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* ▼▼▼▼▼ classNameをinter.classNameに変更します ▼▼▼▼▼ */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}