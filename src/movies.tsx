import { Action, ActionPanel, Keyboard, List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { View } from "./components/view";
import { addMovieToWatchlist, searchMovies } from "./lib/data";
import { Movie } from "./lib/types";

function SearchCommand() {
  const [searchText, setSearchText] = useState<string | undefined>();
  const [movies, setMovies] = useState<Movie[] | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchText) {
      setMovies(undefined);
    }
  }, [searchText]);

  const onSearch = async () => {
    if (searchText) {
      setIsLoading(true);
      const items = await searchMovies(searchText);
      setMovies(items);
      setIsLoading(false);
    }
  };

  const onAddToWatchlist = async (id: number) => {
    setIsLoading(true);
    await addMovieToWatchlist(id);
    setIsLoading(false);
    showToast({
      title: "Movie added to watchlist",
      style: Toast.Style.Success,
    });
  };

  const checkInMovie = async (id: number) => {
    setIsLoading(true);
    await checkInMovie(id);
    setIsLoading(false);
    showToast({
      title: "Movie checked in",
      style: Toast.Style.Success,
    });
  };

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      isShowingDetail
      actions={
        <ActionPanel>
          <Action title="Search" shortcut={Keyboard.Shortcut.Common.Open} onAction={onSearch} />
        </ActionPanel>
      }
    >
      <List.EmptyView title="Search for movies" />
      {movies &&
        movies.map((m) => {
          const markdown = `# ${m.movie.title}`;

          return (
            <List.Item
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
                    title="Check-in Movie"
                    shortcut={Keyboard.Shortcut.Common.Edit}
                    onAction={() => checkInMovie(m.movie.ids.trakt)}
                  />
                  <Action.OpenInBrowser
                    url={`https://trakt.tv/movies/${m.movie.ids.slug}`}
                    shortcut={Keyboard.Shortcut.Common.Duplicate}
                  />
                </ActionPanel>
              }
              detail={
                <List.Item.Detail
                  markdown={markdown}
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
