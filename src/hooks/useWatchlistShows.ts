import { AbortError } from "node-fetch";
import { MutableRefObject, useCallback, useState } from "react";
import { addNewShowProgress, checkInEpisode, getEpisodes, removeShowFromWatchlist } from "../api/shows";

export const useWatchlistShows = (abortable: MutableRefObject<AbortController | undefined>) => {
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const removeShowFromWatchlistMutation = async (show: TraktShowListItem) => {
    try {
      await removeShowFromWatchlist(show.show.ids.trakt, abortable.current?.signal);
      setSuccess("Show removed from watchlist");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  };

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

  return { removeShowFromWatchlistMutation, checkInFirstEpisodeMutation, error, success };
};
