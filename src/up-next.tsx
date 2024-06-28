import { Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { getUpNextShows } from "./api/shows";
import { ShowGridItems } from "./components/show-grid";
import { useUpNextShows } from "./hooks/useUpNextShows";

export default function Command() {
  const abortable = useRef<AbortController>();
  const [actionLoading, setActionLoading] = useState(false);
  const { checkInNextEpisodeMutation, error, success } = useUpNextShows(abortable);
  const {
    isLoading,
    data: shows,
    pagination,
    revalidate,
  } = useCachedPromise(
    async () => {
      return await getUpNextShows(abortable.current?.signal);
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

  useEffect(() => {
    if (error) {
      showToast({
        title: error.message,
        style: Toast.Style.Failure,
      });
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      showToast({
        title: success,
        style: Toast.Style.Success,
      });
    }
  }, [success]);

  return (
    <Grid
      isLoading={isLoading || actionLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for shows that are up next"
      throttle={true}
      pagination={pagination}
    >
      <ShowGridItems
        shows={shows as TraktShowList}
        subtitle={(show) =>
          `${show.show.progress?.next_episode?.season}x${show.show.progress?.next_episode?.number.toString().padStart(2, "0")}`
        }
        primaryActionTitle="Check-in Next Episode"
        primaryActionIcon={Icon.Checkmark}
        primaryActionShortcut={Keyboard.Shortcut.Common.Edit}
        primaryAction={(show) => handleAction(show, checkInNextEpisodeMutation)}
      />
    </Grid>
  );
}
