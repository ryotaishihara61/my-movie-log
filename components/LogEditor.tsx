// components/LogEditor.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';

type Props = {
  movieDetails: {
    id: number;
    title: string;
    poster_path: string | null;
  };
  initialLog: {
    id: number;
    status: string;
    rating: number | null;
    comment: string | null;
    watched_date: string | null;
  } | null;
};

export default function LogEditor({ movieDetails, initialLog }: Props) {
  const router = useRouter();
  const [log, setLog] = useState(initialLog);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLog(initialLog);
    if (initialLog) {
      setRating(initialLog.rating || 0);
      setComment(initialLog.comment || "");
      setWatchedDate(initialLog.watched_date || new Date().toISOString().split('T')[0]);
    }
  }, [initialLog]);

  // ▼▼▼▼▼ 全てのデータ操作関数を try...catch...finally 構文で修正 ▼▼▼▼▼
  const handleAddToWatchlist = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('movie').insert({
        id: movieDetails.id,
        title: movieDetails.title,
        poster_path: movieDetails.poster_path,
        status: 'want_to_watch',
      });
      if (error) throw error;
      router.refresh();
    } catch (error: any) {
      alert('追加エラー: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkAsWatched = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("movie")
        .update({ status: "watched", watched_date: new Date().toISOString().split('T')[0] })
        .eq("id", movieDetails.id);
      if (error) throw error;
      router.refresh();
    } catch (error: any) {
      alert("更新エラー: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("この映画をマイリストから完全に削除しますか？")) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('movie')
        .delete()
        .eq('id', movieDetails.id);
      if (error) throw error;
      router.refresh();
    } catch (error: any) {
      alert("削除エラー: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveLog = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("movie")
        .update({ rating: rating, comment: comment, watched_date: watchedDate || null })
        .eq("id", movieDetails.id);
      if (error) throw error;
      alert("保存しました！");
    } catch (error: any) {
      alert("保存エラー: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  const stars = [1, 2, 3, 4, 5].map((star) => ( <span key={star} className={`cursor-pointer text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-500'}`} onClick={() => setRating(star)}>★</span> ));

  if (!log) {
    return ( <button onClick={handleAddToWatchlist} disabled={isLoading} className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 transition-colors disabled:bg-gray-400"> {isLoading ? '追加中...' : '「観たい！」リストに追加'} </button> );
  }

  if (log.status === 'want_to_watch') {
    return (
      <div className="space-y-2">
        <div className="rounded-lg bg-gray-700 text-white text-center py-2 px-4 border border-blue-500">「観たい」リストに追加済み</div>
        <button onClick={handleMarkAsWatched} disabled={isLoading} className="w-full rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 transition-colors disabled:bg-gray-400">
          {isLoading ? '処理中...' : '「視聴済み」にする'}
        </button>
        <button onClick={handleDelete} disabled={isLoading} className="w-full text-sm text-gray-400 hover:text-white disabled:text-gray-600">
          リストから削除
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4">評価・感想を記録</h3>
      <div className="mb-4">
        <label htmlFor="watched-date" className="block text-sm font-medium text-gray-300 mb-1">鑑賞日</label>
        <input id="watched-date" type="date" value={watchedDate} onChange={(e) => setWatchedDate(e.target.value)} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">評価</label>
        <div>{stars}</div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">感想</label>
        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="感想を記録しよう" className="w-full h-24 bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>
      <button onClick={handleSaveLog} disabled={isLoading} className="w-full mt-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 transition-colors disabled:bg-gray-400">
        {isLoading ? '保存中...' : 'この内容で記録する'}
      </button>
      <button onClick={handleDelete} disabled={isLoading} className="w-full mt-2 text-sm text-gray-400 hover:text-white disabled:text-gray-600">
        リストから削除
      </button>
    </div>
  );
}