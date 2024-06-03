import { Action, ActionPanel, Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { setMaxListeners } from "events";
import { AbortError } from "node-fetch";
import { useEffect, useRef, useState } from "react";
import { MovieGrid } from "./components/movie-grid";
import { Seasons } from "./components/seasons";
import { View } from "./components/view";
import { IMDB_APP_URL, TMDB_IMG_URL, TRAKT_APP_URL } from "./lib/constants";
import { checkInMovie, getWatchlistMovies, removeMovieFromWatchlist } from "./services/movies";
import { getWatchlistShows } from "./services/shows";
import { getTMDBMovieDetails, getTMDBShowDetails } from "./services/tmdb";

const WatchlistCommand = () => {
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
      setMaxListeners(20, abortable.current?.signal);
      setIsLoading(true);
      if (mediaType === "show") {
        const showWatchlist = await getWatchlistShows(page, abortable.current?.signal);
        setShows(showWatchlist);
        setPage(showWatchlist.page);
        setTotalPages(showWatchlist.total_pages);

        const showsWithImages = (await Promise.all(
          showWatchlist.map(async (movie) => {
            movie.show.details = await getTMDBShowDetails(movie.show.ids.tmdb, abortable.current?.signal);
            return movie;
          }),
        )) as TraktShowList;

        setShows(showsWithImages);
      } else {
        const movieWatchlist = await getWatchlistMovies(page, abortable.current?.signal);
        setMovies(movieWatchlist);
        setPage(movieWatchlist.page);
        setTotalPages(movieWatchlist.total_pages);

        const moviesWithImages = (await Promise.all(
          movieWatchlist.map(async (movie) => {
            movie.movie.details = await getTMDBMovieDetails(movie.movie.ids.tmdb, abortable.current?.signal);
            return movie;
          }),
        )) as TraktMovieList;

        setMovies(moviesWithImages);
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
      {mediaType === "movie" && (
        <>
          <Grid.EmptyView title="No movies in your watchlist" />
          <MovieGrid
            movies={movies}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            checkInActionTitle="Check-in Movie"
            checkinAction={onCheckInMovie}
            watchlistActionTitle={"Remove from Watchlist"}
            watchlistAction={onRemoveMovieFromWatchlist}
            watchlistIcon={Icon.Trash}
            watchlistActionShortcut={Keyboard.Shortcut.Common.Remove}
          />
        </>
      )}
      {mediaType === "show" &&
        shows &&
        shows.map((show) => {
          return (
            <Grid.Item
              key={show.id}
              title={`${show.show.title ?? "Unknown Show"} ${show.show.year ? `(${show.show.year})` : ""}`}
              content={`${show.show.details?.poster_path ? `${TMDB_IMG_URL}/${show.show.details.poster_path}` : "poster.png"}`}
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
