import { Toast, showToast } from "@raycast/api";
import { AbortError } from "node-fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { getHistoryShows, removeShowFromHistory } from "../api/shows";
import { getTMDBShowDetails } from "../api/tmdb";

export const useHistoryShows = (page: number, shouldFetch: boolean) => {
  const [shows, setShows] = useState<TraktShowList | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<Error | undefined>();
  const abortable = useRef<AbortController>();

  const fetchShows = useCallback(async () => {
    if (abortable.current) {
      abortable.current.abort();
    }
    abortable.current = new AbortController();
    setIsLoading(true);
    try {
      const showWatchlist = await getHistoryShows(page, abortable?.current?.signal);
      setShows(showWatchlist);
      setTotalPages(showWatchlist.total_pages);

      const showsWithImages = (await Promise.all(
        showWatchlist.map(async (show) => {
          show.show.details = await getTMDBShowDetails(show.show.ids.tmdb, abortable?.current?.signal);
          return show;
        }),
      )) as TraktShowList;

      setShows(showsWithImages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
    setIsLoading(false);
  }, [page]);

  const removeShow = async (showId: number) => {
    setIsLoading(true);
    try {
      await removeShowFromHistory(showId, abortable?.current?.signal);
      showToast({
        title: "Show removed from history",
        style: Toast.Style.Success,
      });
      fetchShows();
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (shouldFetch) {
      fetchShows();
    }
  }, [fetchShows, shouldFetch]);

  return { shows, isLoading, totalPages, removeShow, error };
};
