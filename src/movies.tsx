import { Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { PaginationOptions } from "@raycast/utils/dist/types";
import { setMaxListeners } from "node:events";
import { setTimeout } from "node:timers/promises";
import { useCallback, useRef, useState } from "react";
import { MovieGrid } from "./components/movie-grid";
import { initTraktClient } from "./lib/client";
import { APP_MAX_LISTENERS } from "./lib/constants";
import { TraktMovieListItem, withPagination } from "./lib/schema";

export default function Command() {
  const abortable = useRef<AbortController>();
  const [searchText, setSearchText] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const traktClient = initTraktClient();
  const {
    isLoading,
    data: movies,
    pagination,
  } = useCachedPromise(
    (searchText: string) => async (options: PaginationOptions) => {
      if (!searchText) return { data: [], hasMore: false };
      await setTimeout(100);

      abortable.current = new AbortController();
      setMaxListeners(APP_MAX_LISTENERS, abortable.current?.signal);

      const response = await traktClient.movies.searchMovies({
        query: { query: searchText, page: options.page + 1, limit: 10, fields: "title" },
        fetchOptions: { signal: abortable.current.signal },
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
    [searchText],
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

  const addMovieToWatchlist = useCallback(async (movie: TraktMovieListItem) => {
    await traktClient.movies.addMovieToWatchlist({
      body: { movies: [{ ids: { trakt: movie.movie.ids.trakt } }] },
    });
  }, []);

  const addMovieToHistory = useCallback(async (movie: TraktMovieListItem) => {
    await traktClient.movies.addMovieToHistory({
      body: { movies: [{ ids: { trakt: movie.movie.ids.trakt } }] },
    });
  }, []);

  const checkInMovie = useCallback(async (movie: TraktMovieListItem) => {
    await traktClient.movies.checkInMovie({
      body: { movies: [{ ids: { trakt: movie.movie.ids.trakt } }] },
    });
  }, []);

  const handleSearchTextChange = useCallback(
    (text: string): void => {
      abortable.current?.abort();
      abortable.current = new AbortController();
      setSearchText(text);
    },
    [abortable],
  );

  const handleAction = useCallback(
    async (movie: TraktMovieListItem, action: (movie: TraktMovieListItem) => Promise<void>, message: string) => {
      setActionLoading(true);
      try {
        await action(movie);
        showToast({
          title: message,
          style: Toast.Style.Success,
        });
      } catch (e) {
        showToast({
          title: (e as Error).message,
          style: Toast.Style.Failure,
        });
      } finally {
        setActionLoading(false);
      }
    },
    [],
  );

  return (
    <MovieGrid
      isLoading={isLoading || actionLoading}
      emptyViewTitle="Search for movies"
      searchBarPlaceholder="Search for movies"
      onSearchTextChange={handleSearchTextChange}
      throttle={true}
      pagination={pagination}
      movies={movies}
      primaryActionTitle="Add to Watchlist"
      primaryActionIcon={Icon.Bookmark}
      primaryActionShortcut={Keyboard.Shortcut.Common.Edit}
      primaryAction={(movie) => handleAction(movie, addMovieToWatchlist, "Movie added to watchlist")}
      secondaryActionTitle="Check-in Movie"
      secondaryActionIcon={Icon.Checkmark}
      secondaryActionShortcut={Keyboard.Shortcut.Common.Duplicate}
      secondaryAction={(movie) => handleAction(movie, checkInMovie, "Movie checked in")}
      tertiaryActionTitle="Add to History"
      tertiaryActionIcon={Icon.Clock}
      tertiaryActionShortcut={Keyboard.Shortcut.Common.ToggleQuickLook}
      tertiaryAction={(movie) => handleAction(movie, addMovieToHistory, "Movie added to history")}
    />
  );
}
