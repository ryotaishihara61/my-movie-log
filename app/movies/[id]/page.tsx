// app/movies/[id]/page.tsx

import { supabase } from "@/lib/supabase";
import LogEditor from "@/components/LogEditor";
import BackButton from "@/components/BackButton";

// (型定義やgetMovieDetails, getMyLog関数は変更ありません)
type MovieDetails = { id: number; title: string; overview: string; poster_path: string; release_date: string; };
type MyLog = { id: number; status: string; rating: number | null; comment: string | null; watched_date: string | null; };
async function getMovieDetails(id: string): Promise<MovieDetails | null> {
  const apiKey = process.env.TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=ja-JP`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
async function getMyLog(movieId: number): Promise<MyLog | null> {
  const { data, error } = await supabase.from("movie").select("id, status, rating, comment, watched_date").eq("id", movieId).single();
  if (error && error.code !== 'PGRST116') {
    console.error("ログの取得エラー:", error);
    return null;
  }
  return data;
}

// ▼▼▼▼▼ 新しく、このページが受け取るPropsの型を定義します ▼▼▼▼▼
type Props = {
  params: { id: string };
};
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// ▼▼▼▼▼ コンポーネントの引数で、作成したProps型を使います ▼▼▼▼▼
export default async function MovieDetailPage({ params }: Props) {
  const id = params.id;
  
  const [movie, myLog] = await Promise.all([
    getMovieDetails(id),
    getMyLog(Number(id)),
  ]);
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  if (!movie) {
    return <div className="p-4">映画が見つかりませんでした。</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <div className="mb-8">
        <BackButton />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          {movie.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="rounded-lg shadow-lg"
            />
          ) : (
            <div className="bg-gray-700 aspect-[2/3] w-full rounded-lg flex items-center justify-center">
              <p className="text-xs text-gray-400">画像なし</p>
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <p className="text-sm text-gray-400 mb-4">{movie.release_date}公開</p>
          
          <div className="mt-8">
            <LogEditor movieId={movie.id} initialLog={myLog} />
          </div>

          <h2 className="text-xl font-semibold mb-2 mt-8">あらすじ</h2>
          <p className="leading-relaxed">{movie.overview}</p>
        </div>
      </div>
    </main>
  );
}