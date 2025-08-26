// components/SearchMovies.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 型定義
type Movie = { id: number; title: string; poster_path: string | null; genre_ids: number[]; };
type Genre = { id: number; name: string; };

// ▼▼▼▼▼ propsの型定義を修正 ▼▼▼▼▼
type Props = {
  allMyLogs: Map<number, string>;
};

const sortOptions = [
  { value: 'popularity.desc', label: '人気順' },
  { value: 'vote_average.desc', label: '評価順' },
  { value: 'release_date.desc', label: '公開日が新しい順' },
  { value: 'revenue.desc', label: '収益順' },
];

// ▼▼▼▼▼ コンポーネントがpropsを受け取るように変更 ▼▼▼▼▼
export default function SearchMovies({ allMyLogs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState(sortOptions[0].value);
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [lastSearch, setLastSearch] = useState({ type: '', value: '' });
  const [searchType, setSearchType] = useState<'movie' | 'person'>('movie');

  // (useEffect, handleGenreToggle, handleSearch, handleLoadMore は変更ありません)
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

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres((prevSelected) =>
      prevSelected.includes(genreId)
        ? prevSelected.filter((id) => id !== genreId)
        : [...prevSelected, genreId]
    );
  };
  
  const handleSearch = async (page = 1, currentQuery = query, currentGenres = selectedGenres, currentSort = sortBy, currentSearchType = searchType) => {
    if (!currentQuery && currentGenres.length === 0) {
      if (page === 1) alert('キーワードを入力するか、ジャンルを一つ以上選択してください。');
      return;
    }
    setIsLoading(true);
    if (page === 1) { setResults([]); }
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    let url = '';
    let finalResults: Movie[] = [];
    let apiTotalPages = 0;
    let apiTotalResults = 0;
    const params = new URLSearchParams();
    if (currentQuery) {
      params.set('query', currentQuery);
      params.set('searchType', currentSearchType);
    }
    if (currentGenres.length > 0) params.set('genres', currentGenres.join(','));
    if (!currentQuery) params.set('sort', currentSort);
    router.push(`/search?${params.toString()}`, { scroll: false });
    try {
      if (currentQuery) {
        if (currentSearchType === 'person') {
          // 人物検索の場合
          setLastSearch({ type: 'person', value: currentQuery });
          // まず人物を検索
          const personUrl = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(currentQuery)}&language=ja-JP&page=1`;
          const personRes = await fetch(personUrl);
          const personData = await personRes.json();
          
          if (personData.results && personData.results.length > 0) {
            // 各人物について映画を取得
            const allMovies: Movie[] = [];
            const movieIds = new Set<number>();
            
            for (const person of personData.results.slice(0, 5)) { // 最初の5人まで検索
              const creditsUrl = `https://api.themoviedb.org/3/person/${person.id}/movie_credits?api_key=${apiKey}&language=ja-JP`;
              const creditsRes = await fetch(creditsUrl);
              const creditsData = await creditsRes.json();
              
              // キャストと監督の映画を結合
              const movies = [...(creditsData.cast || []), ...(creditsData.crew || []).filter((c: any) => c.job === 'Director')];
              
              movies.forEach((movie: any) => {
                if (!movieIds.has(movie.id) && movie.poster_path) {
                  movieIds.add(movie.id);
                  allMovies.push({
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    genre_ids: movie.genre_ids || []
                  });
                }
              });
            }
            
            // 重複を除去し、日付順にソート
            finalResults = allMovies
              .filter((movie, index, self) => self.findIndex(m => m.id === movie.id) === index)
              .sort((a, b) => b.id - a.id) // IDが大きいほど新しい映画
              .slice((page - 1) * 20, page * 20); // ページネーション
            
            apiTotalPages = Math.ceil(allMovies.length / 20);
            apiTotalResults = allMovies.length;
          }
        } else {
          // 映画検索の場合（既存の処理）
          setLastSearch({ type: 'keyword', value: currentQuery });
          url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(currentQuery)}&language=ja-JP&page=${page}`;
          const res = await fetch(url);
          const data = await res.json();
          const filtered = currentGenres.length > 0
            ? data.results.filter((movie: Movie) => currentGenres.every(genreId => movie.genre_ids.includes(genreId)))
            : data.results;
          finalResults = filtered;
          apiTotalPages = data.total_pages;
          apiTotalResults = data.total_results;
        }
      } 
      else if (currentGenres.length > 0) {
        setLastSearch({ type: 'genre', value: currentGenres.join(',') });
        const genresQuery = currentGenres.join(',');
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genresQuery}&language=ja-JP&sort_by=${currentSort}&page=${page}`;
        const res = await fetch(url);
        const data = await res.json();
        finalResults = data.results;
        apiTotalPages = data.total_pages;
        apiTotalResults = data.total_results;
      }
      setResults(prev => page === 1 ? finalResults : [...prev, ...finalResults]);
      if(page === 1) {
        setTotalPages(apiTotalPages);
        setTotalResults(apiTotalResults);
      }
      setCurrentPage(page);
    } catch (error) { console.error('検索エラー:', error); }
    setIsLoading(false);
  };
  
  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    handleSearch(nextPage);
  };

  useEffect(() => {
    const genresFromUrl = searchParams.get('genres');
    const sortByFromUrl = searchParams.get('sort');
    const queryFromUrl = searchParams.get('query');
    const searchTypeFromUrl = searchParams.get('searchType') as 'movie' | 'person' || 'movie';
    const newSelectedGenres = genresFromUrl ? genresFromUrl.split(',').map(Number) : [];
    const newSortBy = sortByFromUrl || sortOptions[0].value;
    const newQuery = queryFromUrl || '';
    setSelectedGenres(newSelectedGenres);
    setSortBy(newSortBy);
    setQuery(newQuery);
    setSearchType(searchTypeFromUrl);
    if (newQuery || newSelectedGenres.length > 0) {
      handleSearch(1, newQuery, newSelectedGenres, newSortBy, searchTypeFromUrl);
    }
  }, []);

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
      <div className="mb-4">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600/30">
          <h3 className="text-lg font-semibold mb-4 text-green-400">検索タイプ</h3>
          <div className="flex gap-6 mb-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="search-type" 
                value="movie" 
                checked={searchType === 'movie'} 
                onChange={(e) => setSearchType(e.target.value as 'movie' | 'person')} 
                className="w-4 h-4 text-green-500" 
              />
              <span className="group-hover:text-green-400 transition-colors">映画・タイトル</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="search-type" 
                value="person" 
                checked={searchType === 'person'} 
                onChange={(e) => setSearchType(e.target.value as 'movie' | 'person')} 
                className="w-4 h-4 text-green-500" 
              />
              <span className="group-hover:text-green-400 transition-colors">俳優・監督名</span>
            </label>
          </div>
          <h3 className="text-lg font-semibold mb-3 text-green-400">キーワード</h3>
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder={searchType === 'movie' ? '映画のタイトル、あらすじ...' : '俳優名、監督名...'} 
            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" 
          />
        </div>
      </div>
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600/30 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-green-400">ジャンル</h3>
        <div className="flex flex-wrap gap-3">
          {genres.map((genre) => ( 
            <button 
              key={genre.id} 
              onClick={() => handleGenreToggle(genre.id)} 
              className={`text-sm rounded-full px-4 py-2 font-medium transition-all duration-200 transform hover:scale-105 ${
                selectedGenres.includes(genre.id) 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600/30 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-green-400">
          並び順 
          <span className="text-xs text-gray-400 font-normal ml-2">（キーワード検索時は無効）</span>
        </h3>
        <div className="flex flex-wrap gap-4">
          {sortOptions.map((option) => ( 
            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="sort-by" 
                value={option.value} 
                checked={sortBy === option.value} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="w-4 h-4 text-green-500" 
                disabled={!!query} 
              />
              <span className={`group-hover:text-green-400 transition-colors ${
                !!query ? 'text-gray-500' : 'text-gray-300'
              }`}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="text-center mb-8">
        <button 
          onClick={() => handleSearch(1)} 
          disabled={isLoading && currentPage === 1} 
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-green-500/30"
        >
          {isLoading && currentPage === 1 ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              検索中...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>🔍</span>
              この条件で検索
            </div>
          )}
        </button>
      </div>

      {totalResults > 0 && ( 
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-400">
            検索結果：約 <span className="text-2xl">{totalResults}</span> 件
          </h3>
        </div>
      )}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* ▼▼▼▼▼ 検索結果の表示部分を修正 ▼▼▼▼▼ */}
          {results.map((movie) => {
            const status = allMyLogs.get(movie.id);
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
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}
      {results.length > 0 && currentPage < totalPages && !isLoading && (
        <div className="text-center mt-12">
          <button 
            onClick={handleLoadMore} 
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
}