import { Action, ActionPanel, Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { setMaxListeners } from "events";
import { AbortError } from "node-fetch";
import { useEffect, useRef, useState } from "react";
import { Seasons } from "./components/seasons";
import { View } from "./components/view";
import { IMDB_APP_URL, TMDB_IMG_URL, TRAKT_APP_URL } from "./lib/constants";
import { TraktMovieList, TraktShowList } from "./lib/types";
import { checkInMovie, getWatchlistMovies, removeMovieFromWatchlist } from "./services/movies";
import { getWatchlistShows } from "./services/shows";

const WatchlistCommand = () => {
  setMaxListeners(20);

  const abortable = useRef<AbortController>();
  const [movies, setMovies] = useState<TraktMovieList | undefined>();
  const [shows, setShows] = useState<TraktShowList | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mediaType, setMediaType] = useState("movie");
  const [x, forceRerender] = useState(0);

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setIsLoading(true);
      if (mediaType === "show") {
        const showWatchlist = await getWatchlistShows(page, abortable.current?.signal);
        setShows(showWatchlist);
        setPage(showWatchlist.page);
        setTotalPages(showWatchlist.total_pages);
      } else {
        const movieWatchlist = await getWatchlistMovies(page, abortable.current?.signal);
        setMovies(movieWatchlist);
        setPage(movieWatchlist.page);
        setTotalPages(movieWatchlist.total_pages);
      }
      setIsLoading(false);
      return () => {
        if (abortable.current) {
          abortable.current.abort();
        }
      };
    })();
  }, [x, mediaType, page]);

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

  const onMediaTypeChange = (newValue: string) => {
    setMediaType(newValue);
    setPage(1);
    setTotalPages(1);
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
      {mediaType === "movie" &&
        movies &&
        movies.map((movie) => {
          return (
            <Grid.Item
              key={movie.id}
              title={`${movie.movie.title ?? "Unknown Movie"} ${movie.movie.year ? `(${movie.movie.year})` : ""}`}
              content={`${movie.movie.poster_path ? `${TMDB_IMG_URL}/${movie.movie.poster_path}` : "poster.png"}`}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.OpenInBrowser
                      title="Open in Trakt"
                      url={`${TRAKT_APP_URL}/movies/${movie.movie.ids.slug}`}
                    />
                    <Action.OpenInBrowser title="Open in IMDb" url={`${IMDB_APP_URL}/${movie.movie.ids.imdb}`} />
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
                    {page === totalPages ? null : (
                      <Action
                        icon={Icon.ArrowRight}
                        title="Next Page"
                        shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
                        onAction={() => setPage((page) => (page + 1 > totalPages ? totalPages : page + 1))}
                      />
                    )}
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
      {mediaType === "show" &&
        shows &&
        shows.map((show) => {
          return (
            <Grid.Item
              key={show.id}
              title={`${show.show.title ?? "Unknown Show"} ${show.show.year ? `(${show.show.year})` : ""}`}
              content={`${show.show.poster_path ? `${TMDB_IMG_URL}/${show.show.poster_path}` : "poster.png"}`}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.OpenInBrowser title="Open in Trakt" url={`${TRAKT_APP_URL}/shows/${show.show.ids.slug}`} />
                    <Action.OpenInBrowser title="Open in IMDb" url={`${IMDB_APP_URL}/${show.show.ids.imdb}`} />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <Action.Push
                      icon={Icon.Switch}
                      title="Seasons"
                      shortcut={Keyboard.Shortcut.Common.Open}
                      target={
                        <Seasons
                          traktId={show.show.ids.trakt}
                          tmdbId={show.show.ids.tmdb}
                          slug={show.show.ids.slug}
                          imdbId={show.show.ids.imdb}
                        />
                      }
                    />
                    <Action
                      icon={Icon.Trash}
                      title="Remove from Watchlist"
                      shortcut={Keyboard.Shortcut.Common.Remove}
                      onAction={() => onRemoveMovieFromWatchlist(show.show.ids.trakt)}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    {page === totalPages ? null : (
                      <Action
                        icon={Icon.ArrowRight}
                        title="Next Page"
                        shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
                        onAction={() => setPage((page) => (page + 1 > totalPages ? totalPages : page + 1))}
                      />
                    )}
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
