import { Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import { MovieGrid } from "./components/movie-grid";
import { ShowGrid } from "./components/show-grid";
import { useHistoryMovies } from "./hooks/useHistoryMovies";
import { useHistoryShows } from "./hooks/useHistoryShows";

export default function Command() {
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<MediaType>("movie");

  const {
    movies,
    isLoading: moviesLoading,
    totalPages: totalMoviePages,
    onRemoveMovieFromHistory,
    error: movieError,
    success: movieSuccess,
  } = useHistoryMovies(page, mediaType === "movie");
  const {
    shows,
    isLoading: showsLoading,
    totalPages: totalShowPages,
    onRemoveShowFromHistory,
    error: showError,
    success: showSuccess,
  } = useHistoryShows(page, mediaType === "show");

  useEffect(() => {
    if (movieError) {
      showToast({
        title: movieError.message,
        style: Toast.Style.Failure,
      });
    }
  }, [movieError]);

  useEffect(() => {
    if (showError) {
      showToast({
        title: showError.message,
        style: Toast.Style.Failure,
      });
    }
  }, [showError]);

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

  const isLoading = mediaType === "movie" ? moviesLoading : showsLoading;
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
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            historyActionTitle="Remove from History"
            historyActionIcon={Icon.Trash}
            historyActionShortcut={Keyboard.Shortcut.Common.Remove}
            historyAction={onRemoveMovieFromHistory}
          />
        </>
      )}
      {mediaType === "show" && (
        <>
          <Grid.EmptyView title="No shows in your history" />
          <ShowGrid
            shows={shows}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            historyActionTitle="Remove from History"
            historyActionIcon={Icon.Trash}
            historyActionShortcut={Keyboard.Shortcut.Common.Remove}
            historyAction={onRemoveShowFromHistory}
          />
        </>
      )}
    </Grid>
  );
}
