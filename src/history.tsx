import { Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { PaginationOptions } from "@raycast/utils/dist/types";
import { setMaxListeners } from "node:events";
import { setTimeout } from "node:timers/promises";
import { useCallback, useRef, useState } from "react";
import { MovieHistoryGrid, ShowHistoryGrid } from "./components/history-grid";
import { initTraktClient } from "./lib/client";
import { APP_MAX_LISTENERS } from "./lib/constants";
import { TraktMediaType, TraktMovieHistoryListItem, TraktShowHistoryListItem, withPagination } from "./lib/schema";

const formatter = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" });

export default function Command() {
  const abortable = useRef<AbortController>();
  const [mediaType, setMediaType] = useState<TraktMediaType>("movie");
  const [actionLoading, setActionLoading] = useState(false);
  const traktClient = initTraktClient();
  const {
    isLoading: isMovieLoading,
    data: movies,
    pagination: moviePagination,
    revalidate: revalidateMovie,
  } = useCachedPromise(
    (mediaType: TraktMediaType) => async (options: PaginationOptions) => {
      await setTimeout(100);
      if (mediaType === "show") {
        return { data: [], hasMore: false };
      }
      abortable.current = new AbortController();
      setMaxListeners(APP_MAX_LISTENERS, abortable.current?.signal);

      const response = await traktClient.movies.getMovieHistory({
        query: {
          page: options.page + 1,
          limit: 10,
          extended: "full,cloud9",
          sort_by: "added",
          sort_how: "asc",
        },
        fetchOptions: {
          signal: abortable.current.signal,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch movies");
      }

      const paginatedResponse = withPagination(response);

      return {
        data: paginatedResponse.data,
        hasMore:
          paginatedResponse.pagination["x-pagination-page"] < paginatedResponse.pagination["x-pagination-page-count"],
      };
    },
    [mediaType],
    {
      initialData: undefined,
      keepPreviousData: true,
      abortable,
      onError(error) {
        showToast({
          title: error.message,
          style: Toast.Style.Failure,
        });
      },
    },
  );
  const {
    isLoading: isShowsLoading,
    data: shows,
    pagination: showPagination,
    revalidate: revalidateShow,
  } = useCachedPromise(
    (mediaType: TraktMediaType) => async (options: PaginationOptions) => {
      await setTimeout(100);
      if (mediaType === "movie") {
        return { data: [], hasMore: false };
      }
      abortable.current = new AbortController();
      setMaxListeners(APP_MAX_LISTENERS, abortable.current?.signal);

      const response = await traktClient.shows.getShowHistory({
        query: {
          page: options.page + 1,
          limit: 10,
          extended: "full,cloud9",
          sort_by: "added",
          sort_how: "asc",
        },
        fetchOptions: {
          signal: abortable.current.signal,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch movies");
      }

      const paginatedResponse = withPagination(response);

      return {
        data: paginatedResponse.data,
        hasMore:
          paginatedResponse.pagination["x-pagination-page"] < paginatedResponse.pagination["x-pagination-page-count"],
      };
    },
    [mediaType],
    {
      initialData: undefined,
      keepPreviousData: true,
      abortable,
      onError(error) {
        showToast({
          title: error.message,
          style: Toast.Style.Failure,
        });
      },
    },
  );

  const removeMovieFromHistory = useCallback(async (movie: TraktMovieHistoryListItem) => {
    await traktClient.movies.removeMovieFromHistory({
      body: {
        movies: [
          {
            ids: {
              trakt: movie.movie.ids.trakt,
            },
          },
        ],
      },
      fetchOptions: {
        signal: abortable.current?.signal,
      },
    });
  }, []);

  const removeEpisodeFromHistory = useCallback(async (episode: TraktShowHistoryListItem) => {
    await traktClient.shows.removeEpisodeFromHistory({
      body: {
        episodes: [
          {
            ids: {
              trakt: episode.episode.ids.trakt,
            },
          },
        ],
      },
      fetchOptions: {
        signal: abortable.current?.signal,
      },
    });
    console.log("Remove episode from history", episode);
  }, []);

  const onMediaTypeChange = useCallback((newValue: string) => {
    abortable.current?.abort();
    abortable.current = new AbortController();
    setMediaType(newValue as TraktMediaType);
  }, []);

  const handleMovieAction = useCallback(
    async (
      movie: TraktMovieHistoryListItem,
      action: (movie: TraktMovieHistoryListItem) => Promise<void>,
      message: string,
    ) => {
      setActionLoading(true);
      try {
        await action(movie);
        revalidateMovie();
        showToast({
          title: message,
          style: Toast.Style.Success,
        });
      } catch (error) {
        showToast({
          title: (error as Error).message,
          style: Toast.Style.Failure,
        });
      } finally {
        setActionLoading(false);
      }
    },
    [],
  );

  const handleShowAction = useCallback(
    async (
      episode: TraktShowHistoryListItem,
      action: (episode: TraktShowHistoryListItem) => Promise<void>,
      message: string,
    ) => {
      setActionLoading(true);
      try {
        await action(episode);
        revalidateShow();
        showToast({
          title: message,
          style: Toast.Style.Success,
        });
      } catch (error) {
        showToast({
          title: (error as Error).message,
          style: Toast.Style.Failure,
        });
      } finally {
        setActionLoading(false);
      }
    },
    [],
  );

  return mediaType === "movie" ? (
    <MovieHistoryGrid
      isLoading={isMovieLoading || actionLoading}
      emptyViewTitle="No shows in your history"
      searchBarPlaceholder="Search history"
      searchBarAccessory={
        <Grid.Dropdown onChange={onMediaTypeChange} tooltip="Media Type">
          <Grid.Dropdown.Item value="movie" title="Movies" />
          <Grid.Dropdown.Item value="show" title="Shows" />
        </Grid.Dropdown>
      }
      pagination={moviePagination}
      movies={movies}
      title={(item) => item.movie.title}
      subtitle={(item) => (item.watched_at ? ` (${formatter.format(new Date(item.watched_at))})` : "")}
      primaryActionTitle="Remove from history"
      primaryActionIcon={Icon.Trash}
      primaryActionShortcut={Keyboard.Shortcut.Common.Remove}
      primaryAction={(item) => handleMovieAction(item, removeMovieFromHistory, "Movie removed from history")}
    />
  ) : (
    <ShowHistoryGrid
      isLoading={isShowsLoading || actionLoading}
      emptyViewTitle="No shows in your history"
      searchBarPlaceholder="Search history"
      searchBarAccessory={
        <Grid.Dropdown onChange={onMediaTypeChange} tooltip="Media Type">
          <Grid.Dropdown.Item value="movie" title="Movies" />
          <Grid.Dropdown.Item value="show" title="Shows" />
        </Grid.Dropdown>
      }
      pagination={showPagination}
      episodes={shows}
      title={(item) => {
        return `${item.show.title} - ${item.episode.title}`;
      }}
      subtitle={(item) =>
        `${item.episode.season}x${item.episode.number.toString().padStart(2, "0")}${item.watched_at ? ` (${formatter.format(new Date(item.watched_at))})` : ""}`
      }
      primaryActionTitle="Remove from history"
      primaryActionIcon={Icon.Trash}
      primaryActionShortcut={Keyboard.Shortcut.Common.Remove}
      primaryAction={(item) => handleShowAction(item, removeEpisodeFromHistory, "Episode removed from history")}
    />
  );
}
