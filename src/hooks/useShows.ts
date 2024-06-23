import { AbortError } from "node-fetch";
import { setMaxListeners } from "node:events";
import { useCallback, useEffect, useRef, useState } from "react";
import { addShowToHistory, addShowToWatchlist, searchShows } from "../api/shows";
import { APP_MAX_LISTENERS } from "../lib/constants";

export function useShows(searchText: string | undefined, page: number) {
  const abortable = useRef<AbortController>();
  const [shows, setShows] = useState<TraktShowList | undefined>();
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const fetchShows = useCallback(async () => {
    if (!searchText) {
      setShows(undefined);
      return;
    }

    try {
      const shows = await searchShows(searchText, page, abortable.current?.signal);
      setShows(shows);
      setTotalPages(shows.total_pages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  }, [searchText, page]);

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

  useEffect(() => {
    (async () => {
      if (abortable.current) {
        abortable.current.abort();
      }
      abortable.current = new AbortController();
      setMaxListeners(APP_MAX_LISTENERS, abortable.current.signal);
      await fetchShows();
    })();
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [fetchShows]);

  return {
    shows,
    addShowToWatchlistMutation,
    addShowToHistoryMutation,
    error,
    success,
    totalPages,
  };
}
