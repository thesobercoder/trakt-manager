import { AbortError } from "node-fetch";
import { MutableRefObject, useCallback, useState } from "react";
import {
  addMovieToHistory,
  addMovieToWatchlist,
  checkInMovie,
  removeMovieFromHistory,
  removeMovieFromWatchlist,
} from "../api/movies";

export function useMovieMutations(abortable: MutableRefObject<AbortController | undefined>) {
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const addMovieToWatchlistMutation = useCallback(async (movie: TraktMovieListItem) => {
    try {
      await addMovieToWatchlist(movie.movie.ids.trakt, abortable.current?.signal);
      setSuccess("Movie added to watchlist");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  }, []);

  const checkInMovieMutation = useCallback(async (movie: TraktMovieListItem) => {
    try {
      await checkInMovie(movie.movie.ids.trakt, abortable.current?.signal);
      setSuccess("Movie checked in");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  }, []);

  const addMovieToHistoryMutation = useCallback(async (movie: TraktMovieListItem) => {
    try {
      await addMovieToHistory(movie.movie.ids.trakt, abortable.current?.signal);
      setSuccess("Movie added to history");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  }, []);

  const removeMovieFromHistoryMutation = async (movie: TraktMovieListItem) => {
    try {
      await removeMovieFromHistory(movie.movie.ids.trakt, abortable.current?.signal);
      setSuccess("Movie removed from history");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  };

  const removeMovieFromWatchlistMutation = async (movie: TraktMovieListItem) => {
    try {
      await removeMovieFromWatchlist(movie.movie.ids.trakt, abortable.current?.signal);
      setSuccess("Movie removed from watchlist");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  };

  return {
    addMovieToWatchlistMutation,
    checkInMovieMutation,
    addMovieToHistoryMutation,
    removeMovieFromHistoryMutation,
    removeMovieFromWatchlistMutation,
    error,
    success,
  };
}