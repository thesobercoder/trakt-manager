import { Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import { MovieGrid } from "./components/movie-grid";
import { ShowGrid } from "./components/show-grid";
import { useWatchlistMovies } from "./hooks/useWatchlistMovies";
import { useWatchlistShows } from "./hooks/useWatchlistShows";

export default function Command() {
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<MediaType>("movie");

  const {
    movies,
    isLoading: moviesLoading,
    totalPages: totalMoviePages,
    onRemoveMovieFromWatchlist,
    error: movieError,
    success: movieSuccess,
  } = useWatchlistMovies(page, mediaType === "movie");

  const {
    shows,
    isLoading: showsLoading,
    totalPages: totalShowPages,
    onRemoveShowFromWatchlist,
    error: showError,
    success: showSuccess,
  } = useWatchlistShows(page, mediaType === "show");

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
      searchBarPlaceholder="Search watchlist"
      searchBarAccessory={
        <Grid.Dropdown onChange={onMediaTypeChange} tooltip="Media Type">
          <Grid.Dropdown.Item value="movie" title="Movies" />
          <Grid.Dropdown.Item value="show" title="Shows" />
        </Grid.Dropdown>
      }
    >
      {mediaType === "movie" && (
        <>
          <Grid.EmptyView title="No movies in your watchlist" />
          <MovieGrid
            movies={movies}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            watchlistActionTitle="Remove from Watchlist"
            watchlistActionIcon={Icon.Trash}
            watchlistActionShortcut={Keyboard.Shortcut.Common.Remove}
            watchlistAction={onRemoveMovieFromWatchlist}
          />
        </>
      )}
      {mediaType === "show" && (
        <>
          <Grid.EmptyView title="No shows in your watchlist" />
          <ShowGrid
            shows={shows}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            watchlistActionTitle="Remove from Watchlist"
            watchlistActionIcon={Icon.Trash}
            watchlistActionShortcut={Keyboard.Shortcut.Common.Remove}
            watchlistAction={onRemoveShowFromWatchlist}
          />
        </>
      )}
    </Grid>
  );
}
