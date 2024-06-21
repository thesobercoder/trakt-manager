import { Toast, showToast } from "@raycast/api";
import { AbortError } from "node-fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { getHistoryMovies, removeMovieFromHistory } from "../api/movies";
import { getTMDBMovieDetails } from "../api/tmdb";

export const useHistoryMovies = (page: number, shouldFetch: boolean) => {
  const [movies, setMovies] = useState<TraktMovieList | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const abortable = useRef<AbortController>();

  const fetchMovies = useCallback(async () => {
    if (abortable.current) {
      abortable.current.abort();
    }
    abortable.current = new AbortController();
    setIsLoading(true);
    try {
      const movieWatchlist = await getHistoryMovies(page, abortable?.current?.signal);
      setMovies(movieWatchlist);
      setTotalPages(movieWatchlist.total_pages);

      const moviesWithImages = (await Promise.all(
        movieWatchlist.map(async (movie) => {
          movie.movie.details = await getTMDBMovieDetails(movie.movie.ids.tmdb, abortable?.current?.signal);
          return movie;
        }),
      )) as TraktMovieList;

      setMovies(moviesWithImages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        showToast({
          title: "Error loading movies",
          style: Toast.Style.Failure,
        });
      }
    }
    setIsLoading(false);
  }, [page]);

  const removeMovie = async (movieId: number) => {
    setIsLoading(true);
    try {
      await removeMovieFromHistory(movieId, abortable?.current?.signal);
      showToast({
        title: "Movie removed from history",
        style: Toast.Style.Success,
      });
      fetchMovies();
    } catch (e) {
      if (!(e instanceof AbortError)) {
        showToast({
          title: "Error removing movie from history",
          style: Toast.Style.Failure,
        });
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (shouldFetch) {
      fetchMovies();
    }
  }, [fetchMovies, shouldFetch]);

  return { movies, isLoading, totalPages, removeMovie };
};
