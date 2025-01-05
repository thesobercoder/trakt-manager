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
  const [actionLoading, setActionLoading] = useState(false);
  const traktClient = initTraktClient();
  const {
    isLoading,
    data: shows,
    pagination,
    revalidate,
  } = useCachedPromise(
    () => async (options: PaginationOptions) => {
      await setTimeout(200);

      abortable.current = new AbortController();
      setMaxListeners(APP_MAX_LISTENERS, abortable.current?.signal);

      const response = await traktClient.shows.getUpNextShows({
        query: { page: options.page + 1, limit: 10, extended: "full,cloud9", sort_by: "added", sort_how: "asc" },
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
    [],
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

  const checkInNextEpisode = useCallback(async (show: TraktShowListItem) => {
    await traktClient.shows.checkInEpisode({
      body: {
        episode: [
          {
            ids: {
              trakt: show.progress.next_episode.ids.trakt,
            },
          },
        ],
      },
      fetchOptions: { signal: abortable.current?.signal },
    });
  }, []);

  const handleAction = useCallback(
    async (show: TraktShowListItem, action: (show: TraktShowListItem) => Promise<void>) => {
      setActionLoading(true);
      try {
        await action(show);
        revalidate();
      } finally {
        setActionLoading(false);
      }
    },
    [],
  );

  return (
    <ShowGrid
      isLoading={isLoading || actionLoading}
      emptyViewTitle="No up next shows"
      searchBarPlaceholder="Search for shows that are up next"
      pagination={pagination}
      shows={shows}
      subtitle={(show) =>
        `${show.progress?.next_episode?.season}x${show.progress?.next_episode?.number.toString().padStart(2, "0")}`
      }
      primaryActionTitle="Check-in Next Episode"
      primaryActionIcon={Icon.Checkmark}
      primaryActionShortcut={Keyboard.Shortcut.Common.Edit}
      primaryAction={(show) => handleAction(show, checkInNextEpisode)}
    />
  );
}
