// components/LogEditor.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// このコンポーネントが受け取るデータ（props）の型定義
type Props = {
  movieId: number;
  initialLog: {
    id: number;
    status: string;
    rating: number | null;
    comment: string | null;
    watched_date: string | null;
  } | null;
};

export default function LogEditor({ movieId, initialLog }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 最初にDBから取得した値でフォームを初期化する
  useEffect(() => {
    if (initialLog) {
      setRating(initialLog.rating || 0);
      setComment(initialLog.comment || "");
      setWatchedDate(initialLog.watched_date || "");
    }
  }, [initialLog]);

  // 星評価のUIを生成
  const stars = [1, 2, 3, 4, 5].map((star) => (
    <span
      key={star}
      className={`cursor-pointer text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-500'}`}
      onClick={() => setRating(star)}
    >
      ★
    </span>
  ));

  // 保存ボタンが押された時の処理
  const handleSaveLog = async () => {
    setIsLoading(true);
    // initialLogが存在しない場合はINSERT、存在する場合はUPDATE
    const operation = initialLog 
      ? supabase.from("movie").update({
          rating: rating,
          comment: comment,
          watched_date: watchedDate || null,
        }).eq("id", movieId)
      : supabase.from("movie").insert({
          id: movieId,
          // title, poster_pathなども本当は必要だが、このコンポーネントは受け取っていない
          // このロジックはデモ用であり、実際には「観たい」ボタンで先にinsertされているはず
          rating: rating,
          comment: comment,
          watched_date: watchedDate || null,
          status: "watched",
        });

    const { error } = await operation;

    if (error) {
      alert("保存エラー: " + error.message);
    } else {
      alert("保存しました！");
    }
    setIsLoading(false);
  };

  // 「観たい」リストに入っている場合は、その状態を表示
  if (initialLog?.status === 'want_to_watch') {
    return <div className="rounded-lg bg-blue-500 text-white text-center py-2 px-4">「観たい」リストに追加済み</div>;
  }
  
  // 「視聴済み」もしくはまだログがない場合に、評価・感想フォームを表示
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4">評価・感想を記録</h3>
      
      <div className="mb-4">
        <label htmlFor="watched-date" className="block text-sm font-medium text-gray-300 mb-1">鑑賞日</label>
        <input
          id="watched-date"
          type="date"
          value={watchedDate}
          onChange={(e) => setWatchedDate(e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">評価</label>
        <div>{stars}</div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">感想</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="感想を記録しよう"
          className="w-full h-24 bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        onClick={handleSaveLog}
        disabled={isLoading}
        className="w-full mt-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 transition-colors disabled:bg-gray-400"
      >
        {isLoading ? '保存中...' : 'この内容で記録する'}
      </button>
    </div>
  );
}