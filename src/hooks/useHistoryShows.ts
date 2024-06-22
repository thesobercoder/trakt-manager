import { AbortError } from "node-fetch";
import { setMaxListeners } from "node:events";
import { useCallback, useEffect, useRef, useState } from "react";
import { getHistoryShows, removeShowFromHistory } from "../api/shows";
import { getTMDBShowDetails } from "../api/tmdb";
import { APP_MAX_LISTENERS } from "../lib/constants";

export const useHistoryShows = (page: number, shouldFetch: boolean) => {
  const [shows, setShows] = useState<TraktShowList | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const abortable = useRef<AbortController>();

  const fetchShows = useCallback(async () => {
    try {
      const showHistory = await getHistoryShows(page, abortable.current?.signal);
      setShows(showHistory);
      setTotalPages(showHistory.total_pages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
        setIsLoading(false);
      }
    }
  }, [page]);

  const fetchShowDetails = useCallback(async (showsList: TraktShowList) => {
    try {
      const showsWithImages = (await Promise.all(
        showsList.map(async (showItem) => {
          if (showItem.show.details) return showItem;
          showItem.show.details = await getTMDBShowDetails(showItem.show.ids.tmdb, abortable.current?.signal);
          return showItem;
        }),
      )) as TraktShowList;

      setShows(showsWithImages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
        setIsLoading(false);
      }
    }
  }, []);

  const onRemoveShowFromHistory = async (showId: number) => {
    setIsLoading(true);
    try {
      await removeShowFromHistory(showId, abortable.current?.signal);
      setSuccess("Show removed from history");
      await fetchShows();
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
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
      fetchShows();
    }
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [fetchShows, shouldFetch]);

  useEffect(() => {
    if (shows && shows.some((show) => !show.show.details)) {
      fetchShowDetails(shows);
      setIsLoading(false);
    }
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [shows, fetchShowDetails]);

  return { shows, isLoading, totalPages, onRemoveShowFromHistory, error, success };
};
