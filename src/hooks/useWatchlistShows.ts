import { AbortError } from "node-fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { getWatchlistShows, removeShowFromWatchlist } from "../api/shows";

export const useWatchlistShows = (page: number, shouldFetch: boolean) => {
  const [shows, setShows] = useState<TraktShowList | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const abortable = useRef<AbortController>();

  const fetchShows = useCallback(async () => {
    try {
      const showWatchlist = await getWatchlistShows(page, abortable.current?.signal);
      setShows(showWatchlist);
      setTotalPages(showWatchlist.total_pages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
        setIsLoading(false);
      }
    }
  }, [page]);

  const removeShowFromWatchlistMutation = async (show: TraktShowListItem) => {
    setIsLoading(true);
    try {
      await removeShowFromWatchlist(show.show.ids.trakt, abortable.current?.signal);
      setSuccess("Show removed from watchlist");
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
      if (abortable.current) {
        abortable.current.abort();
      }
      abortable.current = new AbortController();
      setIsLoading(true);
      fetchShows();
    }
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [fetchShows, shouldFetch]);

  return { shows, isLoading, totalPages, removeShowFromWatchlistMutation, error, success };
};
