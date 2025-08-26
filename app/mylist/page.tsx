// app/mylist/page.tsx

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// 型定義
type MyLogItem = {
  id: number;
  title: string;
  poster_path: string | null;
  status: string;
};

// 全ログを取得する関数
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

// マイリストページコンポーネント
export default async function MyListPage() {
  const allMyLogs = await getAllMyLogs();
  const watchedMovies = allMyLogs.filter(movie => movie.status === 'watched');
  const wantToWatchMovies = allMyLogs.filter(movie => movie.status === 'want_to_watch');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📚</div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            マイリスト
          </h1>
          <p className="text-gray-400 text-lg">
            あなたの映画コレクション
          </p>
        </div>

        {allMyLogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 opacity-50">🎬</div>
            <p className="text-xl text-gray-400 mb-8">まだ映画が登録されていません</p>
            <Link 
              href="/search" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <span className="mr-2">🔍</span>
              映画を検索する
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 観たい映画セクション */}
            {wantToWatchMovies.length > 0 && (
              <section>
                <div className="flex items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-blue-400">観たい映画</h2>
                    <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                      {wantToWatchMovies.length}件
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {wantToWatchMovies.map((movie) => (
                    <div key={movie.id} className="group relative">
                      <Link href={`/movies/${movie.id}`} className="block">
                        <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 group-hover:scale-105">
                          {movie.poster_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                              alt={movie.title} 
                              className="w-full aspect-[2/3] object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                              <p className="text-sm text-gray-400">画像なし</p>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded">
                            観たい
                          </div>
                        </div>
                        <h3 className="text-sm mt-2 font-medium group-hover:text-blue-400 transition-colors line-clamp-2">
                          {movie.title}
                        </h3>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 視聴済み映画セクション */}
            {watchedMovies.length > 0 && (
              <section>
                <div className="flex items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-purple-400">視聴済み</h2>
                    <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                      {watchedMovies.length}件
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {watchedMovies.map((movie) => (
                    <div key={movie.id} className="group relative">
                      <Link href={`/movies/${movie.id}`} className="block">
                        <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300 group-hover:scale-105">
                          {movie.poster_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                              alt={movie.title} 
                              className="w-full aspect-[2/3] object-cover"
                            />
                          ) : (
                            <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                              <p className="text-sm text-gray-400">画像なし</p>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold py-1 px-2 rounded">
                            視聴済み
                          </div>
                        </div>
                        <h3 className="text-sm mt-2 font-medium group-hover:text-purple-400 transition-colors line-clamp-2">
                          {movie.title}
                        </h3>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}