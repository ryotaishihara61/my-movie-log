// app/page.tsx

import Link from 'next/link';

// ホームページコンポーネント
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center py-16">
        <div className="mb-12">
          <div className="text-8xl mb-6">🎬</div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            My Movie Log
          </h1>
          <p className="text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            映画の記録と発見をサポートする<br />
            あなただけのシネマダイアリー
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/search" className="group transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-10 rounded-2xl border border-green-500/30 hover:border-green-400/50 backdrop-blur-sm shadow-xl hover:shadow-green-500/20">
              <div className="text-green-400 text-6xl mb-6 group-hover:animate-pulse">🔍</div>
              <h2 className="text-3xl font-bold mb-4 group-hover:text-green-400 transition-colors">
                映画を検索
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                タイトル、俳優名、監督名で映画を検索。<br />
                新しい映画との出会いを見つけよう
              </p>
              <div className="mt-6 inline-flex items-center text-green-400 font-semibold group-hover:translate-x-2 transition-transform">
                検索を始める →
              </div>
            </div>
          </Link>
          
          <Link href="/mylist" className="group transform hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-10 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 backdrop-blur-sm shadow-xl hover:shadow-blue-500/20">
              <div className="text-blue-400 text-6xl mb-6 group-hover:animate-pulse">📚</div>
              <h2 className="text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                マイリスト
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                観たい映画と視聴済みの映画を管理。<br />
                あなたのシネマライフを記録しよう
              </p>
              <div className="mt-6 inline-flex items-center text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                リストを見る →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}