// app/page.tsx

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SearchMovies from '@/components/SearchMovies';
import Watchlist from '@/components/Watchlist';

//============================================================
// TMDbから人気の映画を取得する関数 (変更なし)
//============================================================
type PopularMovie = {
  id: number;
  title: string;
  poster_path: string;
};
async function getPopularMovies(): Promise<PopularMovie[] | null> {
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

//============================================================
// Supabaseから「観たい」リストを取得する関数 (変更なし)
//============================================================
type WatchlistMovie = {
  id: number;
  title: string;
  poster_path: string;
};
async function getWatchlist(): Promise<WatchlistMovie[]> {
  const { data, error } = await supabase
    .from('movie')
    .select('*')
    .eq('status', 'want_to_watch')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('「観たい」リストの取得に失敗しました:', error);
    return [];
  }
  return data || [];
}

// ▼▼▼▼▼ ここから新規追加 ▼▼▼▼▼
//============================================================
// Supabaseから「視聴済み」リストを取得する関数
//============================================================
type WatchedMovie = {
  id: number;
  title: string;
  poster_path: string;
};

async function getWatchedList(): Promise<WatchedMovie[]> {
  const { data, error } = await supabase
    .from('movie')
    .select('*')
    .eq('status', 'watched') // statusが 'watched' のものを取得
    .order('created_at', { ascending: false });

  if (error) {
    console.error('「視聴済み」リストの取得に失敗しました:', error);
    return [];
  }
  return data || [];
}
// ▲▲▲▲▲ ここまで新規追加 ▲▲▲▲▲

//============================================================
// メインのページコンポーネント
//============================================================
export default async function HomePage() {
  // 3種類のデータを取得
  const popularMovies = await getPopularMovies();
  const watchlist = await getWatchlist();
  const watchedList = await getWatchedList(); // ← 追加

  return (
    <main className="container mx-auto p-4">
      <SearchMovies />

      {/* 「観たい」リストのセクション (変更なし) */}
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-blue-500 pl-3">
        観たいリスト
      </h1>
      <Watchlist initialWatchlist={watchlist} />

      {/* ▼▼▼▼▼ ここから新規追加 ▼▼▼▼▼ */}
      {/* 「視聴済み」リストのセクション */}
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-purple-500 pl-3">
        視聴済みリスト
      </h1>
      {watchedList && watchedList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {watchedList.map((movie) => (
            <Link href={`/movies/${movie.id}`} key={movie.id} className="block">
              <div>
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded-lg shadow-md opacity-70" // 少し見た目を変えて区別
                  />
                ) : (
                  <div className="bg-gray-700 aspect-[2/3] w-full rounded-lg flex items-center justify-center opacity-70">
                    <p className="text-xs text-gray-400">画像なし</p>
                  </div>
                )}
                <h2 className="text-sm mt-2 truncate">{movie.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mb-12 text-gray-400">視聴済みの映画はありません。</p>
      )}
      {/* ▲▲▲▲▲ ここまで新規追加 ▲▲▲▲▲ */}

      {/* 人気の映画セクション (変更なし) */}
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-yellow-500 pl-3">
        人気の映画
      </h1>
      {popularMovies ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {popularMovies.map((movie) => (
            <Link href={`/movies/${movie.id}`} key={movie.id} className="block hover:scale-105 transition-transform">
              <div>
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded-lg shadow-md"
                  />
                ) : (
                  <div className="bg-gray-700 aspect-[2/3] w-full rounded-lg flex items-center justify-center">
                    <p className="text-xs text-gray-400">画像なし</p>
                  </div>
                )}
                <h2 className="text-sm mt-2 truncate">{movie.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>人気の映画情報を取得できませんでした。</p>
      )}
    </main>
  );
}