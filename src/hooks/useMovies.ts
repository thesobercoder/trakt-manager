import { AbortError } from "node-fetch";
import { setMaxListeners } from "node:events";
import { useCallback, useEffect, useRef, useState } from "react";
import { addMovieToHistory, addMovieToWatchlist, checkInMovie, searchMovies } from "../api/movies";
import { getTMDBMovieDetails } from "../api/tmdb";
import { APP_MAX_LISTENERS } from "../lib/constants";

export function useMovies(searchText: string | undefined, page: number) {
  const abortable = useRef<AbortController>();
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<TraktMovieList | undefined>();
  const [movieDetails, setMovieDetails] = useState<MovieDetailsMap>(new Map());
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const fetchMovies = useCallback(async () => {
    if (!searchText) return;

    try {
      const movies = await searchMovies(searchText, page, abortable.current?.signal);
      setMovies(movies);
      setTotalPages(movies.total_pages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
        setIsLoading(false);
      }
    }
  }, [searchText, page]);

  const fetchMovieDetails = useCallback(async (moviesList: TraktMovieList) => {
    try {
      console.count("fethMovieDetails");
      const updatedDetailedMovies = new Map();

      await Promise.all(
        moviesList.map(async (movie) => {
          if (!updatedDetailedMovies.has(movie.movie.ids.trakt)) {
            const details = await getTMDBMovieDetails(movie.movie.ids.tmdb, abortable.current?.signal);
            updatedDetailedMovies.set(movie.movie.ids.trakt, details);
          }
        }),
      );

      setMovieDetails(updatedDetailedMovies);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
        setIsLoading(false);
      }
    }
  }, []);

  const addMovieToWatchlistMutation = useCallback(async (movieId: number) => {
    setIsLoading(true);
    try {
      await addMovieToWatchlist(movieId, abortable.current?.signal);
      setSuccess("Movie added to watchlist");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
    setIsLoading(false);
  }, []);

  const checkInMovieMutation = useCallback(async (movieId: number) => {
    setIsLoading(true);
    try {
      await checkInMovie(movieId, abortable.current?.signal);
      setSuccess("Movie checked in");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
    setIsLoading(false);
  }, []);

  const addMovieToHistoryMutation = useCallback(async (movieId: number) => {
    setIsLoading(true);
    try {
      await addMovieToHistory(movieId, abortable.current?.signal);
      setSuccess("Movie added to history");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!searchText) {
      setMovies(undefined);
      return;
    }

    if (abortable.current) {
      abortable.current.abort();
    }
    abortable.current = new AbortController();
    setMaxListeners(APP_MAX_LISTENERS, abortable.current.signal);
    setIsLoading(true);
    fetchMovies();
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [fetchMovies]);

  useEffect(() => {
    if (searchText && movies) {
      fetchMovieDetails(movies);
      setIsLoading(false);
    }
  }, [searchText, movies, fetchMovieDetails]);

  return {
    isLoading,
    movies,
    movieDetails,
    addMovieToWatchlistMutation,
    checkInMovieMutation,
    addMovieToHistoryMutation,
    error,
    success,
    page,
    totalPages,
  };
}
