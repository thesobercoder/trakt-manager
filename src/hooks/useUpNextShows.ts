import { AbortError } from "node-fetch";
import { setMaxListeners } from "node:events";
import { useCallback, useEffect, useRef, useState } from "react";
import { checkInEpisode, getUpNextShows, updateShowProgress } from "../api/shows";
import { getTMDBShowDetails } from "../api/tmdb";
import { APP_MAX_LISTENERS } from "../lib/constants";

export function useUpNextShows() {
  const abortable = useRef<AbortController>();
  const [isLoading, setIsLoading] = useState(false);
  const [shows, setShows] = useState<TraktUpNextShowList | undefined>();
  const [x, forceRerender] = useState(0);
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const fetchShows = useCallback(async () => {
    try {
      const showHistory = await getUpNextShows(abortable.current?.signal);
      setShows(showHistory);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  }, []);

  const fetchShowDetails = useCallback(async (showsList: TraktUpNextShowList) => {
    try {
      const showsWithImages = (await Promise.all(
        showsList.map(async (show) => {
          if (show.show.details) return show;
          show.show.details = await getTMDBShowDetails(show.show.ids.tmdb, abortable.current?.signal);
          return show;
        }),
      )) as TraktUpNextShowList;

      setShows(showsWithImages);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  }, []);

  useEffect(() => {
    if (abortable.current) {
      abortable.current.abort();
    }
    abortable.current = new AbortController();
    setMaxListeners(APP_MAX_LISTENERS, abortable.current.signal);
    setIsLoading(true);
    fetchShows();
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, [fetchShows, x]);

  useEffect(() => {
    if (shows && shows.some((show) => !show.show.details)) {
      fetchShowDetails(shows);
      setIsLoading(false);
    }
  }, [shows, fetchShowDetails]);

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

  return { isLoading, shows, onCheckInNextEpisode, error, success };
}
