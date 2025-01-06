import { Grid, Icon, Image, Keyboard } from "@raycast/api";
import {
  TraktMovieHistoryList,
  TraktMovieHistoryListItem,
  TraktShowHistoryList,
  TraktShowHistoryListItem,
} from "../lib/schema";
import { HistoryGridItem } from "./history-grid-item";

export const HistoryGrid = ({
  episodes,
  isLoading,
  emptyViewTitle,
  searchBarPlaceholder,
  searchBarAccessory,
  pagination,
  title,
  subtitle,
  primaryActionTitle,
  primaryActionIcon,
  primaryActionShortcut,
  primaryAction,
}: {
  episodes?: TraktShowHistoryList | TraktMovieHistoryList;
  isLoading?: Grid.Props["isLoading"];
  emptyViewTitle?: Grid.EmptyView.Props["title"];
  searchBarPlaceholder?: Grid.Props["searchBarPlaceholder"];
  searchBarAccessory?: Grid.Props["searchBarAccessory"];
  pagination?: Grid.Props["pagination"];
  title: (show: TraktShowHistoryListItem | TraktMovieHistoryListItem) => string;
  subtitle: (episode: TraktShowHistoryListItem | TraktMovieHistoryListItem) => string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (episode: TraktShowHistoryListItem | TraktMovieHistoryListItem) => void;
}) => {
  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder={searchBarPlaceholder ?? "Search for episodes"}
      searchBarAccessory={searchBarAccessory}
      pagination={pagination}
    >
      <Grid.EmptyView title={emptyViewTitle} />
      {episodes &&
        episodes.map((episode) => (
          <HistoryGridItem
            key={episode.id}
            item={episode}
            title={title}
            subtitle={subtitle}
            primaryAction={primaryAction}
            primaryActionIcon={primaryActionIcon ?? Icon.Checkmark}
            primaryActionShortcut={primaryActionShortcut ?? Keyboard.Shortcut.Common.Edit}
            primaryActionTitle={primaryActionTitle ?? "Check-in Episode"}
          />
        ))}
    </Grid>
  );
};
