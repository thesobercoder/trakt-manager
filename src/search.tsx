import { Action, ActionPanel, Detail, List, OAuth } from "@raycast/api";
import { authorize } from "./lib";
import { useEffect } from "react";

export default function Command() {
  useEffect(() => {
    (async () => {
      await authorize();
    })();
  }, [authorize]);

  return (
    <List>
      <List.Item
        icon="list-icon.png"
        title="Greeting"
        actions={
          <ActionPanel>
            <Action.Push title="Show Details" target={<Detail markdown="# Hey! 👋" />} />
          </ActionPanel>
        }
      />
      <List.Item
        icon="list-icon.png"
        title="Hello"
        actions={
          <ActionPanel>
            <Action.Push title="Show Details" target={<Detail markdown="# Hello! 👋" />} />
          </ActionPanel>
        }
      />
    </List>
  );
}
