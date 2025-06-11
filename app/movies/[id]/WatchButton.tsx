// app/movies/[id]/WatchButton.tsx

// ブラウザ側で動作するクライアントコンポーネントであることを示す
"use client";

import { useState } from 'react';
// パスエイリアスを使った、すっきりしたインポート
import { supabase } from '@/lib/supabase';

// このコンポーネントが受け取るデータ（props）の型を定義
type Props = {
  movieId: number;
  title: string;
  posterPath: string;
};

export default function WatchButton({ movieId, title, posterPath }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleClick = async () => {
    setIsLoading(true); // ローディング開始

    // Supabaseの'movie'テーブルにデータを挿入
    const { error } = await supabase.from('movie').insert({
      id: movieId,
      title: title,
      poster_path: posterPath,
      status: 'want_to_watch', // ステータスを「観たい」に設定
    });

    if (error) {
      alert('エラーが発生しました：' + error.message);
      console.error(error);
    } else {
      // 成功した場合
      setIsSaved(true);
    }

    setIsLoading(false); // ローディング終了
  };

  if (isSaved) {
    return <div className="rounded-lg bg-green-500 text-white text-center py-2 px-4">保存済み</div>;
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 transition-colors disabled:bg-gray-400"
    >
      {isLoading ? '保存中...' : '「観たい！」リストに追加'}
    </button>
  );
}