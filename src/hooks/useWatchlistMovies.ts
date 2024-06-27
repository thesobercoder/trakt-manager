import { AbortError } from "node-fetch";
import { MutableRefObject, useCallback, useState } from "react";
import { checkInMovie, removeMovieFromWatchlist } from "../api/movies";

export const useWatchlistMovies = (abortable: MutableRefObject<AbortController | undefined>) => {
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

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

  return {
    removeMovieFromWatchlistMutation,
    checkInMovieMutation,
    error,
    success,
  };
};
