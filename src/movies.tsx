import { Action, ActionPanel, Grid, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { AbortError } from "node-fetch";
import { useEffect, useRef, useState } from "react";
import { View } from "./components/view";
import { TMDB_IMG_URL, TRAKT_APP_URL } from "./lib/constants";
import { Movies } from "./lib/types";
import { addMovieToWatchlist, checkInMovie, searchMovies } from "./services/movies";

function SearchCommand() {
  const abortable = useRef<AbortController>();
  const [searchText, setSearchText] = useState<string | undefined>();
  const [movies, setMovies] = useState<Movies | undefined>();
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
      if (!searchText) {
        setMovies(undefined);
      } else {
        setIsLoading(true);
        try {
          const movies = await searchMovies(searchText, page, abortable.current.signal);
          setMovies(movies);
          setPage(movies.page);
          setTotalPages(movies.total_pages);
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

  const onAddToWatchlist = async (id: number) => {
    setIsLoading(true);
    try {
      await addMovieToWatchlist(id, abortable.current?.signal);
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

  const onCheckInMovie = async (id: number) => {
    setIsLoading(true);
    try {
      await checkInMovie(id, abortable.current?.signal);
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

  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for movies"
      onSearchTextChange={(text) => {
        setSearchText(text);
        setPage(1);
        setTotalPages(1);
      }}
      throttle={true}
    >
      <Grid.EmptyView title="Search for movies" />
      {movies &&
        movies.results.map((movie) => {
          return (
            <Grid.Item
              key={movie.id}
              title={movie.title ?? movie.original_title ?? "Unknown Movie"}
              content={`${TMDB_IMG_URL}/${movie.poster_path}`}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser url={`${TRAKT_APP_URL}/search/tmdb/${movie.id}?id_type=movie`} />
                  <Action
                    title="Add To Watchlist"
                    shortcut={Keyboard.Shortcut.Common.Edit}
                    onAction={() => onAddToWatchlist(movie.id)}
                  />
                  <Action
                    title="Checkin Movie"
                    shortcut={Keyboard.Shortcut.Common.Duplicate}
                    onAction={() => onCheckInMovie(movie.id)}
                  />
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

    // <List
    //   isLoading={isLoading}
    //   onSearchTextChange={setSearchText}
    //   // onSelectionChange={onSelectionChange}
    //   throttle={true}
    //   isShowingDetail={Boolean(movies)}
    // >
    //   <List.EmptyView title="Search for movies" />
    //   {movies &&
    //     movies.results.map((m) => {
    //       const markdown = `<img src="https://image.tmdb.org/t/p/w500/${m.poster_path ?? "poster.png"}" width="120"/>`;
    //       return (
    //         <List.Item
    //           id={`${m.id}`}
    //           key={m.id}
    //           icon="trakt.png"
    //           title={m.title}
    //           actions={
    //             <ActionPanel>
    //               <Action
    //                 title="Add To Watchlist"
    //                 shortcut={Keyboard.Shortcut.Common.Open}
    //                 onAction={() => onAddToWatchlist(m.id)}
    //               />
    //               <Action
    //                 title="Checkin Movie"
    //                 shortcut={Keyboard.Shortcut.Common.Edit}
    //                 onAction={() => checkInMovie(m.id)}
    //               />
    //               {/* <Action.OpenInBrowser
    //                 url={`https://trakt.tv/movies/${m.movie.ids.slug}`}
    //                 shortcut={Keyboard.Shortcut.Common.Duplicate}
    //                 title="Trakt"
    //               /> */}
    //               {/* <Action.OpenInBrowser
    //                 url={`https://www.imdb.com/title/${m.movie.ids.imdb}`}
    //                 shortcut={Keyboard.Shortcut.Common.New}
    //                 title="IMDb"
    //               /> */}
    //               <Action.OpenInBrowser
    //                 url={`https://www.themoviedb.org/movie/${m.id}`}
    //                 shortcut={Keyboard.Shortcut.Common.Pin}
    //                 title="TMDB"
    //               />
    //             </ActionPanel>
    //           }
    //           detail={
    //             <List.Item.Detail
    //               markdown={markdown}
    //               metadata={
    //                 <List.Item.Detail.Metadata>
    //                   <List.Item.Detail.Metadata.Label title="Name" text={m.title} />
    //                   <List.Item.Detail.Metadata.Label title="Year" text={m.release_date} />
    //                 </List.Item.Detail.Metadata>
    //               }
    //             />
    //           }
    //         />
    //       );
    //     })}
    // </List>
  );
}

export default function Command() {
  return (
    <View>
      <SearchCommand />
    </View>
  );
}
