import useSWRInfinite from 'swr/infinite';
import { useState, useEffect } from 'react';

const fetcher = async (url: string) => await fetch(url).then((res) => res.json());
const PAGE_SIZE = 5;

export default function useMovieSuggestions({ genres }: { genres: string[]}) {
  const [pageIndex, setPageIndex] = useState(1);
	const [firstItemId, setFirstItemId] = useState<string | null>(null);
	const [moviesData, setMoviesData] = useState<any[]>([]);
	const { data, mutate, isValidating, isLoading } = useSWRInfinite(
		(index, previousPageData) => {
			if (index && !previousPageData.length) return null;
			
      return `https://yts.mx/api/v2/list_movies.json?${encodeURIComponent(genres.map((genre) => `genre=${genre}`).join('&'))}&limit=${PAGE_SIZE}&page=${pageIndex}`;
		},
		fetcher
	);

  const movies = data?.[0].data?.movies || [];
  const movie_count = data?.[0].data?.movie_count || 0;
  const total_pages = Math.ceil(movie_count / PAGE_SIZE);
  const hasMore = pageIndex < total_pages;

	const loadMore = () => setPageIndex((prev) => prev + 1);

  useEffect(() => {
		setFirstItemId(null);
		movies.forEach((movie: any) => {
			if (!moviesData.find((m) => m?.id === movie?.id)) {
				if (!firstItemId) setFirstItemId(movie?.id);
				setMoviesData((prev) => [...prev, movie]);
			}
		});
	}, [movies]);

  return {
    moviesList: moviesData,
		firstItemId,
		pageSize: PAGE_SIZE,
    hasMore,
		loadMore,
		isLoading,
    isValidating,
  };
}