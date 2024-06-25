import { Grid, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { MovieGridItems } from "./components/movie-grid";
import { useMovieDetails } from "./hooks/useMovieDetails";
import { useMovies } from "./hooks/useMovies";

export default function Command() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState<string | undefined>();
  const [actionLoading, setActionLoading] = useState(false);
  const [cachedMovies, setCachedMovies] = useState<TraktMovieList | undefined>();

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

  const handleSearchTextChange = useCallback((text: string): void => {
    setSearchText(text);
    setPage(1);
    setCachedMovies(undefined); // Reset cache on new search
  }, []);

  // Add logging to debug newPage
  const handleLoadMore = () => {
    // console.log("onLoadMore called with newPage:", newPage);
    setPage((page) => (page + 1 > totalPages ? totalPages : page + 1));
  };

  const handleAction = useCallback(
    async (movie: TraktMovieListItem, action: (movie: TraktMovieListItem) => Promise<void>) => {
      setActionLoading(true);
      try {
        await action(movie);
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

  useEffect(() => {
    if (movies) {
      setCachedMovies((prev) => {
        if (!prev) return movies as TraktMovieList;

        const existingIds = new Set(prev.map((movie) => movie.movie.ids.trakt));
        const newMovies = movies.filter((movie) => !existingIds.has(movie.movie.ids.trakt));

        return [...prev, ...newMovies] as TraktMovieList;
      });
    }
  }, [movies]);

  const isLoading =
    !!searchText &&
    (!movies || !(movieDetails.size === (cachedMovies?.length || 0)) || actionLoading) &&
    !error &&
    !detailsError;

  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for movies"
      onSearchTextChange={handleSearchTextChange}
      throttle={true}
      pagination={{
        pageSize: 10,
        hasMore: page < totalPages,
        onLoadMore: handleLoadMore,
      }}
    >
      <Grid.EmptyView title="Search for movies" />
      <MovieGridItems
        movies={cachedMovies}
        movieDetails={movieDetails}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        primaryActionTitle="Add to Watchlist"
        primaryActionIcon={Icon.Bookmark}
        primaryActionShortcut={Keyboard.Shortcut.Common.Edit}
        primaryAction={(movie) => handleAction(movie, addMovieToWatchlistMutation)}
        secondaryActionTitle="Check-in Movie"
        secondaryActionIcon={Icon.Checkmark}
        secondaryActionShortcut={Keyboard.Shortcut.Common.Duplicate}
        secondaryAction={(movie) => handleAction(movie, checkInMovieMutation)}
        tertiaryActionTitle="Add to History"
        tertiaryActionIcon={Icon.Clock}
        tertiaryActionShortcut={Keyboard.Shortcut.Common.ToggleQuickLook}
        tertiaryAction={(movie) => handleAction(movie, addMovieToHistoryMutation)}
      />
    </Grid>
  );
}
