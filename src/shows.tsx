import { Grid, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { ShowGrid } from "./components/show-grid";
import { useShowDetails } from "./hooks/useShowDetails";
import { useShows } from "./hooks/useShows";

export default function Command() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState<string | undefined>();

  const { shows, addShowToWatchlistMutation, addShowToHistoryMutation, error, success, totalPages } = useShows(
    searchText,
    page,
  );
  const { details: showDetails, error: detailsError } = useShowDetails(shows);

  const onSearchTextChange = useCallback((text: string): void => {
    setSearchText(text);
    setPage(1);
  }, []);

  useEffect(() => {
    if (error) {
      showToast({
        title: error.message,
        style: Toast.Style.Failure,
      });
    }
  }, [error]);

  useEffect(() => {
    if (detailsError) {
      showToast({
        title: detailsError.message,
        style: Toast.Style.Failure,
      });
    }
  }, [detailsError]);

  useEffect(() => {
    if (success) {
      showToast({
        title: success,
        style: Toast.Style.Success,
      });
    }
  }, [success]);

  const isLoading = !!searchText && (!shows || !showDetails) && !error && !detailsError;

  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for shows"
      onSearchTextChange={onSearchTextChange}
      throttle={true}
    >
      <Grid.EmptyView title="Search for shows" />
      <ShowGrid
        shows={shows}
        showDetails={showDetails}
        subtitle={(show) => show.show.year?.toString() || ""}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        primaryActionTitle="Add to Watchlist"
        primaryActionIcon={Icon.Bookmark}
        primaryActionShortcut={Keyboard.Shortcut.Common.Edit}
        primaryAction={addShowToWatchlistMutation}
        secondaryActionTitle="Add to History"
        secondaryActionIcon={Icon.Clock}
        secondaryActionShortcut={Keyboard.Shortcut.Common.ToggleQuickLook}
        secondaryAction={addShowToHistoryMutation}
      />
    </Grid>
  );
}
