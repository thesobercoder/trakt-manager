import { AbortError } from "node-fetch";
import { setMaxListeners } from "node:events";
import { useCallback, useEffect, useRef, useState } from "react";
import { getHistoryMovies, removeMovieFromHistory } from "../api/movies";
import { APP_MAX_LISTENERS } from "../lib/constants";

export const useHistoryMovies = (page: number, shouldFetch: boolean) => {
  const [movies, setMovies] = useState<TraktMovieList | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const abortable = useRef<AbortController>();

  const fetchMovies = useCallback(async () => {
    try {
      const movieHistory = await getHistoryMovies(page, abortable.current?.signal);
      setMovies(movieHistory);
      setTotalPages(movieHistory.total_pages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
        setIsLoading(false);
      }
    }
  }, [page]);

  const removeMovieFromHistoryMutation = async (movie: TraktMovieListItem) => {
    setIsLoading(true);
    try {
      await removeMovieFromHistory(movie.movie.ids.trakt, abortable.current?.signal);
      setSuccess("Movie removed from history");
      await fetchMovies();
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
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
      setIsLoading(false);
    }
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [fetchMovies, shouldFetch]);

  return { movies, isLoading, totalPages, removeMovieFromHistoryMutation, error, success };
};
