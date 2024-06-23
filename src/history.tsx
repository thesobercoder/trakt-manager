import { Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import { MovieGrid } from "./components/movie-grid";
import { ShowGrid } from "./components/show-grid";
import { useHistoryMovies } from "./hooks/useHistoryMovies";
import { useHistoryShows } from "./hooks/useHistoryShows";
import { useMovieDetails } from "./hooks/useMovieDetails";
import { useShowDetails } from "./hooks/useShowDetails";

export default function Command() {
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<MediaType>("movie");

  const {
    movies,
    totalPages: totalMoviePages,
    removeMovieFromHistoryMutation,
    error: movieError,
    success: movieSuccess,
  } = useHistoryMovies(page, mediaType === "movie");
  const { details: movieDetails, error: movieDetailsError } = useMovieDetails(movies);

  const {
    shows,
    totalPages: totalShowPages,
    removeShowFromHistoryMutation,
    error: showError,
    success: showSuccess,
  } = useHistoryShows(page, mediaType === "show");
  const { details: showDetails, error: showDetailsError } = useShowDetails(shows);

  useEffect(() => {
    if (movieError) {
      showToast({
        title: movieError.message,
        style: Toast.Style.Failure,
      });
    }
  }, [movieError]);

  useEffect(() => {
    if (movieDetailsError) {
      showToast({
        title: movieDetailsError.message,
        style: Toast.Style.Failure,
      });
    }
  }, [movieDetailsError]);

  useEffect(() => {
    if (showError) {
      showToast({
        title: showError.message,
        style: Toast.Style.Failure,
      });
    }
  }, [showError]);

  useEffect(() => {
    if (showDetailsError) {
      showToast({
        title: showDetailsError.message,
        style: Toast.Style.Failure,
      });
    }
  }, [showDetailsError]);

  useEffect(() => {
    if (movieSuccess) {
      showToast({
        title: movieSuccess,
        style: Toast.Style.Success,
      });
    }
  }, [movieSuccess]);

  useEffect(() => {
    if (showSuccess) {
      showToast({
        title: showSuccess,
        style: Toast.Style.Success,
      });
    }
  }, [showSuccess]);

  const isLoading =
    mediaType === "movie"
      ? !(movies && movieDetails) && !(movieError || movieDetailsError)
      : !(shows && showDetails) && !(showError || showDetailsError);
  const totalPages = mediaType === "movie" ? totalMoviePages : totalShowPages;

  const onMediaTypeChange = (newValue: string) => {
    setMediaType(newValue as MediaType);
    setPage(1);
  };

  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search history"
      searchBarAccessory={
        <Grid.Dropdown onChange={onMediaTypeChange} tooltip="Media Type">
          <Grid.Dropdown.Item value="movie" title="Movies" />
          <Grid.Dropdown.Item value="show" title="Shows" />
        </Grid.Dropdown>
      }
    >
      {mediaType === "movie" && (
        <>
          <Grid.EmptyView title="No movies in your history" />
          <MovieGrid
            movies={movies}
            movieDetails={movieDetails}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            historyActionTitle="Remove from History"
            historyActionIcon={Icon.Trash}
            historyActionShortcut={Keyboard.Shortcut.Common.Remove}
            historyAction={removeMovieFromHistoryMutation}
          />
        </>
      )}
      {mediaType === "show" && (
        <>
          <Grid.EmptyView title="No shows in your history" />
          <ShowGrid
            shows={shows}
            showDetails={showDetails}
            subtitle={(show) => show.show.year?.toString() || ""}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            secondaryActionTitle="Remove from History"
            secondaryActionIcon={Icon.Trash}
            secondaryActionShortcut={Keyboard.Shortcut.Common.Remove}
            secondaryAction={removeShowFromHistoryMutation}
          />
        </>
      )}
    </Grid>
  );
}
