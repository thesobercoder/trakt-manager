import { Action, ActionPanel, Detail, List } from "@raycast/api";
import { useEffect } from "react";
import { searchMovies } from "./lib/data";
import { View } from "./components/view";

const SearchCommand = () => {
  useEffect(() => {
    (async () => {
      const items = await searchMovies("terminator");
      console.log({ items });
    })();
  });

  return (
    <List>
      <List.Item
        icon="list-icon.png"
        title="Greeting"
        actions={
          <ActionPanel>
            <Action.Push
              title="Show Details"
              target={<Detail markdown="# Hey! 👋" />}
            />
          </ActionPanel>
        }
      />
      <List.Item
        icon="list-icon.png"
        title="Hello"
        actions={
          <ActionPanel>
            <Action.Push
              title="Show Details"
              target={<Detail markdown="# Hello! 👋" />}
            />
          </ActionPanel>
        }
      />
    </List>
  );
};

export default function Command() {
  return (
    <View>
      <SearchCommand />
    </View>
  );
}
