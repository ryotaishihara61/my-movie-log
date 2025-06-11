// components/SearchMovies.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 型定義
type Movie = { id: number; title: string; poster_path: string; };
type Genre = { id: number; name: string; };

const sortOptions = [
  { value: 'popularity.desc', label: '人気順' },
  { value: 'vote_average.desc', label: '評価順' },
  { value: 'release_date.desc', label: '公開日が新しい順' },
  { value: 'revenue.desc', label: '収益順' },
];

export default function SearchMovies() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState(sortOptions[0].value);
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchGenres = async () => {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=ja-JP`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        setGenres(data.genres);
      } catch (error) { console.error('ジャンル一覧の取得エラー:', error); }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const genresFromUrl = searchParams.get('genres');
    const sortByFromUrl = searchParams.get('sort');

    const newSelectedGenres = genresFromUrl ? genresFromUrl.split(',').map(Number) : [];
    const newSortBy = sortByFromUrl || sortOptions[0].value;

    setSelectedGenres(newSelectedGenres);
    setSortBy(newSortBy);

    if (newSelectedGenres.length > 0) {
      handleSearch(1, newSelectedGenres, newSortBy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres((prevSelected) =>
      prevSelected.includes(genreId)
        ? prevSelected.filter((id) => id !== genreId)
        : [...prevSelected, genreId]
    );
  };

  const handleSearch = async (page = 1, currentGenres = selectedGenres, currentSort = sortBy) => {
    if (currentGenres.length === 0) {
      // 検索ボタンを押した時のみアラートを出す
      if (page === 1) alert('ジャンルを一つ以上選択してください。');
      return;
    }

    setIsLoading(true);
    if (page === 1) {
      setResults([]);
    }

    const params = new URLSearchParams();
    params.set('genres', currentGenres.join(','));
    params.set('sort', currentSort);
    
    // ▼▼▼▼▼ ここに { scroll: false } を追加します ▼▼▼▼▼
    router.push(`/?${params.toString()}`, { scroll: false });
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${currentGenres.join(',')}&language=ja-JP&sort_by=${currentSort}&page=${page}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setResults(prev => page === 1 ? data.results : [...prev, ...data.results]);
      setTotalPages(data.total_pages);
      setTotalResults(data.total_results);
      setCurrentPage(data.page);
    } catch (error) {
      console.error('ジャンル検索エラー:', error);
    }
    setIsLoading(false);
  };
  
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    handleSearch(nextPage);
  };

  return (
    <div className="mb-12">
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-green-500 pl-3">
        映画を絞り込み検索
      </h1>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">ジャンルを選択</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button key={genre.id} onClick={() => handleGenreToggle(genre.id)} className={`text-sm rounded-full px-3 py-1 transition-colors ${selectedGenres.includes(genre.id) ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
              {genre.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">並び順</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {sortOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sort-by" value={option.value} checked={sortBy === option.value} onChange={(e) => setSortBy(e.target.value)} className="w-4 h-4" />
              {option.label}
            </label>
          ))}
        </div>
      </div>
      
      <div className="my-4">
        <button onClick={() => handleSearch(1)} disabled={isLoading && currentPage === 1} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400">
          {isLoading && currentPage === 1 ? '検索中...' : 'この条件で検索'}
        </button>
      </div>

      {totalResults > 0 && ( <h3 className="text-lg mb-4">検索結果： 約 {totalResults} 件</h3> )}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((movie) => (
            <Link href={`/movies/${movie.id}`} key={movie.id} className="block hover:scale-105 transition-transform">
              <div>
                {movie.poster_path ? ( <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="rounded-lg shadow-md" /> ) : ( <div className="bg-gray-700 aspect-[2/3] w-full rounded-lg flex items-center justify-center"><p className="text-xs text-gray-400">画像なし</p></div> )}
                <h2 className="text-sm mt-2 truncate">{movie.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}
      {isLoading && currentPage > 1 && <p className="text-center mt-8">読み込み中...</p>}
      {results.length > 0 && currentPage < totalPages && !isLoading && (
        <div className="text-center mt-8">
          <button onClick={handleLoadMore} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
}