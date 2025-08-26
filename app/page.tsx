// app/page.tsx

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SearchMovies from '@/components/SearchMovies';
// Watchlistコンポーネントはもう使わないので削除してもOK
// import Watchlist from '@/components/Watchlist'; 
import { Suspense } from 'react';

// 型定義
type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
};
type MyLogItem = {
  id: number;
  title: string;
  poster_path: string | null;
  status: string;
};

// データ取得関数
async function getPopularMovies(): Promise<Movie[] | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.error("TMDbのAPIキー(TMDB_API_KEY)が設定されていません。");
    return null;
  }
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ja-JP`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('映画情報の取得に失敗しました。');
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ▼▼▼▼▼ 全ログを取得する関数を、表示に必要なデータをすべて取得するように修正 ▼▼▼▼▼
async function getAllMyLogs(): Promise<MyLogItem[]> {
  const { data, error } = await supabase
    .from('movie')
    .select('id, title, poster_path, status')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('全ログの取得に失敗しました:', error);
    return [];
  }
  return data || [];
}


// メインのページコンポーネント
export default async function HomePage() {
  // ▼▼▼▼▼ 取得するデータを変更 ▼▼▼▼▼
  const [popularMovies, allMyLogs] = await Promise.all([
    getPopularMovies(),
    getAllMyLogs(),
  ]);

  // ポスターにタグをつけるためのMapを作成
  const logStatusMap = new Map<number, string>();
  for (const log of allMyLogs) {
    logStatusMap.set(log.id, log.status);
  }

  return (
    <main className="container mx-auto p-4">
      <Suspense fallback={<div className="mb-12"><p>検索フォームを読み込み中...</p></div>}>
        <SearchMovies allMyLogs={logStatusMap} />
      </Suspense>

      {/* ▼▼▼▼▼ ここからが新しい「マイリスト」セクション ▼▼▼▼▼ */}
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-blue-500 pl-3">
        マイリスト
      </h1>
      {allMyLogs && allMyLogs.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {allMyLogs.map((movie) => (
            <div key={movie.id} className="relative">
              <Link href={`/movies/${movie.id}`} className="block">
                <div>
                  {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="rounded-lg shadow-md" />
                  ) : (
                    <div className="bg-gray-700 aspect-[2/3] w-full rounded-lg flex items-center justify-center">
                      <p className="text-xs text-gray-400">画像なし</p>
                    </div>
                  )}
                  <h2 className="text-sm mt-2 truncate">{movie.title}</h2>
                </div>
              </Link>
              <div className={`absolute top-2 left-2 text-xs text-white font-bold py-1 px-2 rounded ${
                movie.status === 'watched' ? 'bg-purple-600' : 'bg-blue-600'
              }`}>
                {movie.status === 'watched' ? '視聴済み' : '観たい'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-12 text-gray-400">マイリストに映画がありません。</p>
      )}
      {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
      

      {/* 人気の映画セクション - 非表示 */}
      {/* 
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-yellow-500 pl-3">
        人気の映画
      </h1>
      {popularMovies ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {popularMovies.map((movie) => {
            const status = logStatusMap.get(movie.id);
            return (
              <div key={movie.id} className="relative">
                <Link href={`/movies/${movie.id}`} className="block hover:scale-105 transition-transform">
                  <div>
                    {movie.poster_path ? ( <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="rounded-lg shadow-md" /> ) : ( <div className="bg-gray-700 aspect-[2/3] w-full rounded-lg flex items-center justify-center"><p className="text-xs text-gray-400">画像なし</p></div> )}
                    <h2 className="text-sm mt-2 truncate">{movie.title}</h2>
                  </div>
                </Link>
                {status && (
                  <div className={`absolute top-2 right-2 text-xs text-white font-bold py-1 px-2 rounded ${
                    status === 'watched' ? 'bg-purple-600' : 'bg-blue-600'
                  }`}>
                    {status === 'watched' ? '視聴済み' : '観たい'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>人気の映画情報を取得できませんでした。</p>
      )}
      */
    </main>
  );
}