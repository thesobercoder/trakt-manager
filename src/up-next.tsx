import { Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import { ShowGrid } from "./components/show-grid";
import { useShowDetails } from "./hooks/useShowDetails";
import { useUpNextShows } from "./hooks/useUpNextShows";

export default function Command() {
  const [page, setPage] = useState(1);
  const { shows, totalPages, onCheckInNextEpisode, error, success } = useUpNextShows(page);
  const { details: showDetails, error: detailsError } = useShowDetails(shows);

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

  const isLoading = (!shows || !showDetails) && !error && !detailsError;

  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for shows that are up next"
      throttle={true}
    >
      <ShowGrid
        shows={shows}
        showDetails={showDetails}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        checkInActionTitle="Check-in Next Episode"
        checkInActionIcon={Icon.Checkmark}
        checkInActionShortcut={Keyboard.Shortcut.Common.Edit}
        checkInAction={onCheckInNextEpisode}
      />
    </Grid>
  );
}
