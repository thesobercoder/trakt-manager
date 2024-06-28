import { AbortError } from "node-fetch";
import { MutableRefObject, useCallback, useState } from "react";
import { addNewShowProgress, addShowToHistory, addShowToWatchlist, checkInEpisode, getEpisodes } from "../api/shows";

export function useShows(abortable: MutableRefObject<AbortController | undefined>) {
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const addShowToWatchlistMutation = useCallback(async (show: TraktShowListItem) => {
    try {
      await addShowToWatchlist(show.show.ids.trakt, abortable.current?.signal);
      setSuccess("Show added to watchlist");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  }, []);

  const addShowToHistoryMutation = useCallback(async (show: TraktShowListItem) => {
    try {
      await addShowToHistory(show.show.ids.trakt, abortable.current?.signal);
      setSuccess("Show added to history");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  }, []);

  const checkInFirstEpisodeMutation = useCallback(async (show: TraktShowListItem) => {
    try {
      const episodes = await getEpisodes(show.show.ids.trakt, 1, abortable.current?.signal);
      if (episodes) {
        const firstEpisode = episodes.find((e) => e.number === 1);
        if (firstEpisode) {
          await checkInEpisode(firstEpisode.ids.trakt, abortable.current?.signal);
          await addNewShowProgress(show, abortable.current?.signal);
          setSuccess("First episode checked-in");
          return;
        }
      }
      setError(new Error("First episode not found"));
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  }, []);

  return {
    addShowToWatchlistMutation,
    addShowToHistoryMutation,
    checkInFirstEpisodeMutation,
    error,
    success,
  };
}
