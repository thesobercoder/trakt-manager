import { setMaxListeners } from "events";
import { AbortError } from "node-fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { getWatchlistMovies, removeMovieFromWatchlist } from "../api/movies";
import { getTMDBMovieDetails } from "../api/tmdb";
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

  const fetchMovieDetails = useCallback(async (moviesList: TraktMovieList) => {
    try {
      const moviesWithImages = (await Promise.all(
        moviesList.map(async (movieItem) => {
          if (movieItem.movie.details) return movieItem;
          movieItem.movie.details = await getTMDBMovieDetails(movieItem.movie.ids.tmdb, abortable.current?.signal);
          return movieItem;
        }),
      )) as TraktMovieList;

      setMovies(moviesWithImages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
        setIsLoading(false);
      }
    }
  }, []);

  const onRemoveMovieFromWatchlist = async (movieId: number) => {
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

  useEffect(() => {
    if (movies && movies.some((movie) => !movie.movie.details)) {
      fetchMovieDetails(movies);
      setIsLoading(false);
    }
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [movies, fetchMovieDetails]);

  return { movies, isLoading, totalPages, onRemoveMovieFromWatchlist, error, success };
};
