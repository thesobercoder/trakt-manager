import { setMaxListeners } from "events";
import { AbortError } from "node-fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { getWatchlistMovies, removeMovieFromWatchlist } from "../api/movies";
import { APP_MAX_LISTENERS } from "../lib/constants";

export const useWatchlistMovies = (page: number, shouldFetch: boolean) => {
  const [movies, setMovies] = useState<TraktMovieList | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const abortable = useRef<AbortController>();

  const fetchMovies = useCallback(async () => {
    try {
      const movieWatchlist = await getWatchlistMovies(page, abortable.current?.signal);
      setMovies(movieWatchlist);
      setTotalPages(movieWatchlist.total_pages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
        setIsLoading(false);
      }
    }
  }, [page]);

  const removeMovieFromWatchlistMutation = async (movieId: number) => {
    setIsLoading(true);
    try {
      await removeMovieFromWatchlist(movieId, abortable.current?.signal);
      setSuccess("Movie removed from watchlist");
      fetchMovies();
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
        setIsLoading(false);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (shouldFetch) {
      if (abortable.current) {
        abortable.current.abort();
      }
      abortable.current = new AbortController();
      setMaxListeners(APP_MAX_LISTENERS, abortable.current?.signal);
      setIsLoading(true);
      fetchMovies();
    }
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [fetchMovies, shouldFetch]);

  return {
    movies,
    isLoading,
    totalPages,
    removeMovieFromWatchlistMutation,
    error,
    success,
  };
};
