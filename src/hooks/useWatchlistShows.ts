import { AbortError } from "node-fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import { getWatchlistShows, removeShowFromWatchlist } from "../api/shows";
import { getTMDBShowDetails } from "../api/tmdb";

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

  const onRemoveShowFromWatchlist = async (showId: number) => {
    setIsLoading(true);
    try {
      await removeShowFromWatchlist(showId, abortable.current?.signal);
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

  return { shows, isLoading, totalPages, onRemoveShowFromWatchlist, error, success };
};
