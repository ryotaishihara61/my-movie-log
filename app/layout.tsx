// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

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
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
          {/* Header */}
          <header className="bg-black/30 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between py-4">
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="text-4xl">🎬</div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                      My Movie Log
                    </h1>
                    <p className="text-sm text-gray-400">映画記録アプリ</p>
                  </div>
                </Link>
                
                <nav className="hidden md:flex space-x-6">
                  <Link 
                    href="/search" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span>🔍</span>
                    <span>検索</span>
                  </Link>
                  <Link 
                    href="/mylist" 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span>📚</span>
                    <span>マイリスト</span>
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-black/40 border-t border-gray-700 mt-12">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🎬</div>
                  <div>
                    <p className="font-semibold">My Movie Log</p>
                    <p className="text-sm text-gray-400">映画の記録と発見をサポート</p>
                  </div>
                </div>
                
                <div className="flex space-x-6 text-sm text-gray-400">
                  <Link href="/" className="hover:text-white transition-colors">ホーム</Link>
                  <Link href="/search" className="hover:text-white transition-colors">検索</Link>
                  <Link href="/mylist" className="hover:text-white transition-colors">マイリスト</Link>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
                <p>&copy; 2024 R-studio. 映画データは The Movie Database (TMDb) を使用しています。</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}