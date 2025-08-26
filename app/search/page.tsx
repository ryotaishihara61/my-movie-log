// app/search/page.tsx

export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase';
import SearchMovies from '@/components/SearchMovies';
import { Suspense } from 'react';

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

// 検索ページコンポーネント
export default async function SearchPage() {
  const allMyLogs = await getAllMyLogs();

  // ポスターにタグをつけるためのMapを作成
  const logStatusMap = new Map<number, string>();
  for (const log of allMyLogs) {
    logStatusMap.set(log.id, log.status);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            映画を検索
          </h1>
          <p className="text-gray-400 text-lg">
            タイトル、俳優名、監督名で映画を見つけよう
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        }>
          <SearchMovies allMyLogs={logStatusMap} />
        </Suspense>
      </div>
    </div>
  );
}