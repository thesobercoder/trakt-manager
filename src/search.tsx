import {
  Action,
  ActionPanel,
  Keyboard,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { addToWatchlist, searchMovies } from "./lib/data";
import { View } from "./components/view";
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
    await addToWatchlist(id);
    setIsLoading(false);
    showToast({
      title: "Trakt Manager",
      message: "Movie added to watchlist",
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
          <Action
            title="Search"
            shortcut={Keyboard.Shortcut.Common.Open}
            onAction={onSearch}
          />
        </ActionPanel>
      }
    >
      <List.EmptyView title="Search for movies" />
      {movies && movies.map((m) => {
        const markdown = `# ${m.movie.title}`;

        return (
          <List.Item
            key={m.movie.ids.trakt}
            icon="trakt.png"
            title={m.movie.title}
            actions={
              <ActionPanel>
                <Action
                  title="Add to watchlist"
                  shortcut={Keyboard.Shortcut.Common.Open}
                  onAction={() => onAddToWatchlist(m.movie.ids.trakt)}
                />
              </ActionPanel>
            }
            detail={
              <List.Item.Detail
                markdown={markdown}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                      title="Name"
                      text={m.movie.title}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Year"
                      text={"2001"}
                    />
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
