import { Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { PaginationOptions } from "@raycast/utils/dist/types";
import { setMaxListeners } from "node:events";
import { setTimeout } from "node:timers/promises";
import { useCallback, useRef, useState } from "react";
import { ShowGrid } from "./components/show-grid";
import { initTraktClient } from "./lib/client";
import { APP_MAX_LISTENERS } from "./lib/constants";
import { TraktShowListItem, withPagination } from "./lib/schema";

export default function Command() {
  const abortable = useRef<AbortController>();
  const [searchText, setSearchText] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const traktClient = initTraktClient();
  const {
    isLoading,
    data: shows,
    pagination,
  } = useCachedPromise(
    (searchText: string) => async (options: PaginationOptions) => {
      if (!searchText) return { data: [], hasMore: false };
      await setTimeout(200);

      abortable.current = new AbortController();
      setMaxListeners(APP_MAX_LISTENERS, abortable.current?.signal);

      const response = await traktClient.shows.searchShows({
        query: {
          query: searchText,
          page: options.page + 1,
          limit: 10,
          fields: "title",
          extended: "full,cloud9",
        },
        fetchOptions: {
          signal: abortable.current.signal,
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch shows");
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

  const addShowToWatchlist = useCallback(async (show: TraktShowListItem) => {
    await traktClient.shows.addShowToWatchlist({
      body: {
        shows: [
          {
            ids: {
              trakt: show.show.ids.trakt,
            },
          },
        ],
      },
      fetchOptions: {
        signal: abortable.current?.signal,
      },
    });
  }, []);

  const addShowToHistory = useCallback(async (show: TraktShowListItem) => {
    await traktClient.shows.addShowToHistory({
      body: {
        shows: [
          {
            ids: {
              trakt: show.show.ids.trakt,
            },
            watched_at: new Date().toISOString(),
          },
        ],
      },
      fetchOptions: {
        signal: abortable.current?.signal,
      },
    });
  }, []);

  const handleSearchTextChange = useCallback((text: string): void => {
    abortable.current?.abort();
    abortable.current = new AbortController();
    setSearchText(text);
  }, []);

  const handleAction = useCallback(
    async (show: TraktShowListItem, action: (show: TraktShowListItem) => Promise<void>) => {
      setActionLoading(true);
      try {
        await action(show);
      } finally {
        setActionLoading(false);
      }
    },
    [],
  );

  return (
    <ShowGrid
      isLoading={isLoading || actionLoading}
      searchBarPlaceholder="Search for shows"
      onSearchTextChange={handleSearchTextChange}
      throttle={true}
      pagination={pagination}
      emptyViewTitle="Search for shows"
      shows={shows}
      subtitle={(show) => show.show.year?.toString() || ""}
      primaryActionTitle="Add to Watchlist"
      primaryActionIcon={Icon.Bookmark}
      primaryActionShortcut={Keyboard.Shortcut.Common.Edit}
      primaryAction={(show) => handleAction(show, addShowToWatchlist)}
      secondaryActionTitle="Add to History"
      secondaryActionIcon={Icon.Clock}
      secondaryActionShortcut={Keyboard.Shortcut.Common.ToggleQuickLook}
      secondaryAction={(show) => handleAction(show, addShowToHistory)}
    />
  );
}
