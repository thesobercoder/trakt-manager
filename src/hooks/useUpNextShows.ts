import { AbortError } from "node-fetch";
import { setMaxListeners } from "node:events";
import { useCallback, useEffect, useRef, useState } from "react";
import { checkInEpisode, getUpNextShows, updateShowProgress } from "../api/shows";
import { APP_MAX_LISTENERS } from "../lib/constants";

export function useUpNextShows(page: number) {
  const abortable = useRef<AbortController>();
  const [isLoading, setIsLoading] = useState(false);
  const [shows, setShows] = useState<TraktShowList | undefined>();
  const [totalPages, setTotalPages] = useState(1);
  const [x, forceRerender] = useState(0);
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const fetchShows = useCallback(async () => {
    try {
      const showHistory = await getUpNextShows(abortable.current?.signal);
      setShows(showHistory);
      setTotalPages(showHistory.total_pages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
        setIsLoading(false);
      }
    }
  }, [page]);

  useEffect(() => {
    if (abortable.current) {
      abortable.current.abort();
    }
    abortable.current = new AbortController();
    setMaxListeners(APP_MAX_LISTENERS, abortable.current.signal);
    setIsLoading(true);
    fetchShows();
    setIsLoading(false);
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [fetchShows, x]);

  const onCheckInNextEpisode = async (episodeId: number | undefined, showId: number) => {
    if (episodeId) {
      setIsLoading(true);
      try {
        await checkInEpisode(episodeId, abortable.current?.signal);
        await updateShowProgress(showId, abortable.current?.signal);
        setSuccess("Episode checked in");
      } catch (e) {
        if (!(e instanceof AbortError)) {
          setError(e as Error);
        }
      }
      setIsLoading(false);
      forceRerender((value) => value + 1);
    }
  };

  return { isLoading, shows, totalPages, onCheckInNextEpisode, error, success };
}
