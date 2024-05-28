import { Action, ActionPanel, Keyboard, List, showToast, Toast } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { View } from "./components/view";
import { Movie } from "./lib/types";
import { addMovieToWatchlist, getMoviePoster, searchMovies } from "./services/movies";

function SearchCommand() {
  const abortable = useRef<AbortController>();
  const [searchText, setSearchText] = useState<string | undefined>();
  const [movies, setMovies] = useState<Movie[] | undefined>();
  const [poster, setPoster] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!searchText) {
      setMovies(undefined);
    }
  }, [searchText]);

  const onSearch = async () => {
    if (searchText) {
      setIsLoading(true);
      try {
        const items = await searchMovies(searchText);
        setMovies(items);
      } catch (e) {
        showToast({
          title: "Error searching movies",
          style: Toast.Style.Failure,
        });
      }
      setIsLoading(false);
    }
  };

  const onAddToWatchlist = async (id: number) => {
    setIsLoading(true);
    try {
      await addMovieToWatchlist(id);
    } catch (e) {
      showToast({
        title: "Error adding movie to watchlist",
        style: Toast.Style.Failure,
      });
    }
    setIsLoading(false);
    showToast({
      title: "Movie added to watchlist",
      style: Toast.Style.Success,
    });
  };

  const checkInMovie = async (id: number) => {
    setIsLoading(true);
    try {
      await checkInMovie(id);
    } catch (e) {
      showToast({
        title: "Error checking in movie",
        style: Toast.Style.Failure,
      });
    }
    setIsLoading(false);
    showToast({
      title: "Movie checked in",
      style: Toast.Style.Success,
    });
  };

  const onSelectionChange = async (id: string | null) => {
    setIsLoading(true);
    if (abortable.current) {
      abortable.current.abort();
    }
    abortable.current = new AbortController();
    if (id) {
      try {
        setPoster(await getMoviePoster(id, abortable.current.signal));
      } catch (e) {
        setPoster(undefined);
      }
    }
    setIsLoading(false);
  };

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      onSelectionChange={onSelectionChange}
      throttle={true}
      isShowingDetail={Boolean(movies)}
      actions={
        <ActionPanel>
          <Action title="Search" shortcut={Keyboard.Shortcut.Common.Open} onAction={onSearch} />
        </ActionPanel>
      }
    >
      <List.EmptyView title="Search for movies" />
      {movies &&
        movies.map((m) => {
          const baseMarkdown = `<img src="poster.png" width="120"/>`;
          const realMarkdown = `<img src="${poster}" width="120"/>`;

          return (
            <List.Item
              id={`${m.movie.ids.trakt}`}
              key={m.movie.ids.trakt}
              icon="trakt.png"
              title={m.movie.title}
              actions={
                <ActionPanel>
                  <Action
                    title="Add To Watchlist"
                    shortcut={Keyboard.Shortcut.Common.Open}
                    onAction={() => onAddToWatchlist(m.movie.ids.trakt)}
                  />
                  <Action
                    title="Checkin Movie"
                    shortcut={Keyboard.Shortcut.Common.Edit}
                    onAction={() => checkInMovie(m.movie.ids.trakt)}
                  />
                  <Action.OpenInBrowser
                    url={`https://trakt.tv/movies/${m.movie.ids.slug}`}
                    shortcut={Keyboard.Shortcut.Common.Duplicate}
                    title="Trakt"
                  />
                  <Action.OpenInBrowser
                    url={`https://www.imdb.com/title/${m.movie.ids.imdb}`}
                    shortcut={Keyboard.Shortcut.Common.New}
                    title="IMDb"
                  />
                </ActionPanel>
              }
              detail={
                <List.Item.Detail
                  markdown={poster ? realMarkdown : baseMarkdown}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label title="Name" text={m.movie.title} />
                      <List.Item.Detail.Metadata.Label title="Year" text={String(m.movie.year || "")} />
                    </List.Item.Detail.Metadata>
                  }
                />
              }
            />
          );
        })}
    </List>
  );
}

export default function Command() {
  return (
    <View>
      <SearchCommand />
    </View>
  );
}
