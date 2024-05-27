import { Action, ActionPanel, Keyboard, List, showToast, Toast } from "@raycast/api";
import { useEffect, useState } from "react";
import { addMovieToWatchlist, searchShows } from "./lib/data";
import { View } from "./components/view";
import { Show } from "./lib/types";
import { Seasons } from "./components/seasons";

function SearchCommand() {
  const [searchText, setSearchText] = useState<string | undefined>();
  const [shows, setShows] = useState<Show[] | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchText) {
      setShows(undefined);
    }
  }, [searchText]);

  const onSearch = async () => {
    if (searchText) {
      setIsLoading(true);
      const items = await searchShows(searchText);
      setShows(items);
      setIsLoading(false);
    }
  };

  const onAddToWatchlist = async (id: number) => {
    setIsLoading(true);
    await addMovieToWatchlist(id);
    setIsLoading(false);
    showToast({
      title: "Show added to watchlist",
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
      <List.EmptyView title="Search for shows" />
      {shows &&
        shows.map((item) => {
          const markdown = `## ${item.show.title}`;

          return (
            <List.Item
              key={item.show.ids.trakt}
              icon="trakt.png"
              title={item.show.title}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Show Seasons"
                    shortcut={Keyboard.Shortcut.Common.Open}
                    target={<Seasons id={item.show.ids.trakt} />}
                  />
                  <Action
                    title="Add To Watchlist"
                    shortcut={Keyboard.Shortcut.Common.Edit}
                    onAction={() => onAddToWatchlist(item.show.ids.trakt)}
                  />
                  <Action.OpenInBrowser
                    url={`https://trakt.tv/shows/${item.show.ids.slug}`}
                    shortcut={Keyboard.Shortcut.Common.Duplicate}
                  />
                </ActionPanel>
              }
              detail={
                <List.Item.Detail
                  markdown={markdown}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label title="Name" text={item.show.title} />
                      <List.Item.Detail.Metadata.Label title="Year" text={String(item.show.year || "")} />
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
