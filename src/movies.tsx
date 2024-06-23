import { Grid, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { MovieGrid } from "./components/movie-grid";
import { useMovieDetails } from "./hooks/useMovieDetails";
import { useMovies } from "./hooks/useMovies";

export default function Command() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState<string | undefined>();
  const {
    movies,
    addMovieToWatchlistMutation,
    checkInMovieMutation,
    addMovieToHistoryMutation,
    error,
    success,
    totalPages,
  } = useMovies(searchText, page);
  const { details: movieDetails, error: detailsError } = useMovieDetails(movies);

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
    if (error) {
      showToast({
        title: error.message,
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

  const isLoading = !!searchText && (!movies || !movieDetails) && !error && !detailsError;

  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for movies"
      onSearchTextChange={onSearchTextChange}
      throttle={true}
    >
      <Grid.EmptyView title="Search for movies" />
      <MovieGrid
        movies={movies}
        movieDetails={movieDetails}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        checkInAction={checkInMovieMutation}
        watchlistActionTitle={"Add to Watchlist"}
        watchlistActionIcon={Icon.Bookmark}
        watchlistActionShortcut={Keyboard.Shortcut.Common.Edit}
        watchlistAction={addMovieToWatchlistMutation}
        historyActionTitle="Add to History"
        historyActionIcon={Icon.Clock}
        historyActionShortcut={Keyboard.Shortcut.Common.ToggleQuickLook}
        historyAction={addMovieToHistoryMutation}
      />
    </Grid>
  );
}
