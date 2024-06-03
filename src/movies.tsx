import { Action, ActionPanel, Grid, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { setMaxListeners } from "events";
import { AbortError } from "node-fetch";
import { useEffect, useRef, useState } from "react";
import { View } from "./components/view";
import { IMDB_APP_URL, TMDB_IMG_URL, TRAKT_APP_URL } from "./lib/constants";
import { addMovieToWatchlist, checkInMovie, searchMovies } from "./services/movies";
import { getTMDBMovieDetails } from "./services/tmdb";

function SearchCommand() {
  const abortable = useRef<AbortController>();
  const [searchText, setSearchText] = useState<string | undefined>();
  const [movies, setMovies] = useState<TraktMovieList | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (abortable.current) {
        abortable.current.abort();
      }
      abortable.current = new AbortController();
      setMaxListeners(20, abortable.current?.signal);
      if (!searchText) {
        setMovies(undefined);
      } else {
        setIsLoading(true);
        try {
          const movies = await searchMovies(searchText, page, abortable.current.signal);
          setMovies(movies);
          setPage(movies.page);
          setTotalPages(movies.total_pages);

          const moviesWithImages = (await Promise.all(
            movies.map(async (movie) => {
              movie.movie.details = await getTMDBMovieDetails(movie.movie.ids.tmdb, abortable.current?.signal);
              return movie;
            }),
          )) as TraktMovieList;

          setMovies(moviesWithImages);
        } catch (e) {
          if (!(e instanceof AbortError)) {
            showToast({
              title: "Error searching movies",
              style: Toast.Style.Failure,
            });
          }
        }
        setIsLoading(false);
      }
    })();
  }, [searchText, page]);

  const onAddToWatchlist = async (movieId: number) => {
    setIsLoading(true);
    try {
      await addMovieToWatchlist(movieId, abortable.current?.signal);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        showToast({
          title: "Error adding movie to watchlist",
          style: Toast.Style.Failure,
        });
      }
    }
    setIsLoading(false);
    showToast({
      title: "Movie added to watchlist",
      style: Toast.Style.Success,
    });
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
  };

  const onSearchTextChange = (text: string): void => {
    setSearchText(text);
    setPage(1);
    setTotalPages(1);
  };

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
      <Grid.Section title={`Page ${page}`}>
        {movies &&
          movies.map((movie) => {
            return (
              <Grid.Item
                key={movie.movie.ids.trakt}
                title={`${movie.movie.title ?? "Unknown Movie"} ${movie.movie.year ? `(${movie.movie.year})` : ""}`}
                content={`${movie.movie.details?.poster_path ? `${TMDB_IMG_URL}/${movie.movie.details.poster_path}` : "poster.png"}`}
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
                        icon={Icon.Bookmark}
                        title="Add To Watchlist"
                        shortcut={Keyboard.Shortcut.Common.Edit}
                        onAction={() => onAddToWatchlist(movie.movie.ids.trakt)}
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
      </Grid.Section>
    </Grid>
  );
}

export default function Command() {
  return (
    <View>
      <SearchCommand />
    </View>
  );
}
