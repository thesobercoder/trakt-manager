import { Action, ActionPanel, Detail, Keyboard, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { searchMovies } from "./lib/data";
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

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
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
        return (
          <List.Item
            icon="trakt.png"
            title={m.movie.title}
            detail={<Detail key={m.movie.ids.slug} />}
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
