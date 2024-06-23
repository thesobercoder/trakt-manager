import { AbortError } from "node-fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { getWatchlistShows, removeShowFromWatchlist } from "../api/shows";

export const useWatchlistShows = (page: number, shouldFetch: boolean) => {
  const abortable = useRef<AbortController>();
  const [shows, setShows] = useState<TraktShowList | undefined>();
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const fetchShows = useCallback(async () => {
    try {
      const showWatchlist = await getWatchlistShows(page, abortable.current?.signal);
      setShows(showWatchlist);
      setTotalPages(showWatchlist.total_pages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  }, [page]);

  const removeShowFromWatchlistMutation = async (show: TraktShowListItem) => {
    try {
      await removeShowFromWatchlist(show.show.ids.trakt, abortable.current?.signal);
      setSuccess("Show removed from watchlist");
      await fetchShows();
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (shouldFetch) {
        if (abortable.current) {
          abortable.current.abort();
        }
        abortable.current = new AbortController();
        await fetchShows();
      }
    })();
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [fetchShows, shouldFetch]);

  return { shows, totalPages, removeShowFromWatchlistMutation, error, success };
};
