import { Action, ActionPanel, Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { AbortError } from "node-fetch";
import { useEffect, useRef, useState } from "react";
import { View } from "./components/view";
import { IMDB_APP_URL, TMDB_IMG_URL, TRAKT_APP_URL } from "./lib/constants";
import { MovieWatchlist } from "./lib/types";
import { checkInMovie, getWatchlist, removeMovieFromWatchlist } from "./services/movies";

const WatchlistCommand = () => {
  const abortable = useRef<AbortController>();
  const [watchlist, setWatchlist] = useState<MovieWatchlist | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [x, forceRerender] = useState(0);

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setIsLoading(true);
      const movieWatchlist = await getWatchlist(page, abortable.current?.signal);
      setWatchlist(movieWatchlist);
      setPage(movieWatchlist.page);
      setTotalPages(movieWatchlist.total_pages);
      setIsLoading(false);
      return () => {
        if (abortable.current) {
          abortable.current.abort();
        }
      };
    })();
  }, [x, page]);

  const onRemoveMovieFromWatchlist = async (movieId: number) => {
    setIsLoading(true);
    try {
      await removeMovieFromWatchlist(movieId, abortable.current?.signal);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        showToast({
          title: "Error checking in movie",
          style: Toast.Style.Failure,
        });
      }
    }
    setIsLoading(false);
    showToast({
      title: "Movie removed from watchlist",
      style: Toast.Style.Success,
    });
    forceRerender((value) => value + 1);
  };

  const onCheckInMovie = async (movieId: number) => {
    setIsLoading(true);
    try {
      await checkInMovie(movieId, abortable.current?.signal);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        showToast({
          title: "Error checking in movie",
          style: Toast.Style.Failure,
        });
      }
    }
    setIsLoading(false);
    showToast({
      title: "Movie checked in",
      style: Toast.Style.Success,
    });
    forceRerender((value) => value + 1);
  };

  return (
    <Grid isLoading={isLoading} aspectRatio="9/16" fit={Grid.Fit.Fill} searchBarPlaceholder="Search watchlist">
      {watchlist &&
        watchlist.map((movie) => {
          return (
            <Grid.Item
              key={movie.id}
              title={`${movie.movie.title ?? "Unknown Movie"} ${movie.movie.year ? `(${movie.movie.year})` : ""}`}
              content={`${movie.movie.poster_path ? `${TMDB_IMG_URL}/${movie.movie.poster_path}` : "poster.png"}`}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.OpenInBrowser title="Trakt" url={`${TRAKT_APP_URL}/movies/${movie.movie.ids.slug}`} />
                    <Action.OpenInBrowser title="IMDb" url={`${IMDB_APP_URL}/${movie.movie.ids.imdb}`} />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <Action
                      icon={Icon.Trash}
                      title="Remove from Watchlist"
                      shortcut={Keyboard.Shortcut.Common.Remove}
                      onAction={() => onRemoveMovieFromWatchlist(movie.movie.ids.trakt)}
                    />
                    <Action
                      icon={Icon.Checkmark}
                      title="Check-in Movie"
                      shortcut={Keyboard.Shortcut.Common.Duplicate}
                      onAction={() => onCheckInMovie(movie.movie.ids.trakt)}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <Action
                      icon={Icon.ArrowRight}
                      title="Next Page"
                      shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
                      onAction={() => setPage((page) => (page + 1 > totalPages ? totalPages : page + 1))}
                    />
                    {page > 1 ? (
                      <Action
                        icon={Icon.ArrowLeft}
                        title="Previous Page"
                        shortcut={{ modifiers: ["cmd"], key: "arrowLeft" }}
                        onAction={() => setPage((page) => (page - 1 < 1 ? 1 : page - 1))}
                      />
                    ) : null}
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })}
    </Grid>
  );
};

export default function Command() {
  return (
    <View>
      <WatchlistCommand />
    </View>
  );
}
