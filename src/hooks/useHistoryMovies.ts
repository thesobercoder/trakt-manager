import { AbortError } from "node-fetch";
import { MutableRefObject, useState } from "react";
import { removeMovieFromHistory } from "../api/movies";

export const useHistoryMovies = (abortable: MutableRefObject<AbortController | undefined>) => {
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

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

  return { removeMovieFromHistoryMutation, error, success };
};
