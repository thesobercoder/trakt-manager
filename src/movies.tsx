import { Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { PaginationOptions } from "@raycast/utils/dist/types";
import { setTimeout } from "node:timers/promises";
import { useCallback, useEffect, useRef, useState } from "react";
import { searchMovies } from "./api/movies";
import { MovieGridItems } from "./components/movie-grid";
import { useMovies } from "./hooks/useMovies";

export default function Command() {
  const abortable = useRef<AbortController>();
  const [searchText, setSearchText] = useState<string>("");
  const [details] = useState<MovieDetailsMap>(new Map());
  const [actionLoading, setActionLoading] = useState(false);
  const { addMovieToWatchlistMutation, checkInMovieMutation, addMovieToHistoryMutation, error, success } = useMovies();
  const {
    isLoading,
    data: movies,
    pagination,
  } = useCachedPromise(
    (searchText: string) => async (options: PaginationOptions) => {
      if (!searchText) {
        return { data: [], hasMore: false };
      }
      await setTimeout(200);
      const pagedMovies = await searchMovies(searchText, options.page + 1, abortable.current?.signal);
      return { data: pagedMovies, hasMore: options.page < pagedMovies.total_pages };
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
  const handleSearchTextChange = useCallback((text: string): void => {
    setSearchText(text);
  }, []);

  useEffect(() => {
    return () => abortable.current?.abort();
  });

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
      searchBarPlaceholder="Search for movies"
      onSearchTextChange={handleSearchTextChange}
      throttle={true}
      pagination={pagination}
    >
      <Grid.EmptyView title="Search for movies" />
      <MovieGridItems
        movies={movies}
        movieDetails={details}
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
