// components/Watchlist.tsx

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Movie = { id: number; title: string; poster_path: string | null; };
type Props = { initialWatchlist: Movie[]; };

export default function Watchlist({ initialWatchlist }: Props) {
  const [movies, setMovies] = useState(initialWatchlist);
  const router = useRouter();

  const handleMarkAsWatched = async (movieId: number) => {
    const { error } = await supabase.from('movie').update({ status: 'watched' }).eq('id', movieId);
    if (error) { alert('更新エラー：' + error.message); } 
    else {
      setMovies(movies.filter((movie) => movie.id !== movieId));
      router.refresh();
    }
  };

  const handleDelete = async (movieId: number) => {
    if (!window.confirm("この映画をリストから完全に削除しますか？")) { return; }
    const { error } = await supabase.from('movie').delete().eq('id', movieId);
    if (error) { alert('削除エラー：' + error.message); } 
    else {
      setMovies(movies.filter((movie) => movie.id !== movieId));
      router.refresh();
    }
  };
  
  if (movies.length === 0) {
    return <p className="mb-12 text-gray-400">「観たい！」リストに映画を追加してみましょう。</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
      {movies.map((movie) => (
        // ▼▼▼▼▼ divとLinkの構造を修正 ▼▼▼▼▼
        <div key={movie.id} className="relative group">
          <Link href={`/movies/${movie.id}`} className="block">
            {movie.poster_path ? ( <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="rounded-lg shadow-md" /> ) : ( <div className="bg-gray-700 aspect-[2/3] w-full rounded-lg flex items-center justify-center"><p className="text-xs text-gray-400">画像なし</p></div> )}
            <h2 className="text-sm mt-2 truncate">{movie.title}</h2>
          </Link>
          
          {/* タグを追加 */}
          <div className="absolute top-2 left-2 text-xs text-white font-bold py-1 px-2 rounded bg-blue-600">
            観たい
          </div>

          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleMarkAsWatched(movie.id)} className="bg-black bg-opacity-70 text-white text-xs rounded-full px-2 py-1">観た！</button>
            <button onClick={() => handleDelete(movie.id)} className="bg-red-700 bg-opacity-80 text-white text-xs rounded-full px-2 py-1">削除</button>
          </div>
        </div>
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
      ))}
    </div>
  );
}