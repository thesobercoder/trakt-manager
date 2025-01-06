import { Grid, Icon, Image, Keyboard } from "@raycast/api";
import {
  TraktMovieHistoryList,
  TraktMovieHistoryListItem,
  TraktShowHistoryList,
  TraktShowHistoryListItem,
} from "../lib/schema";
import { MovieHistoryGridItem, ShowHistoryGridItem } from "./history-grid-item";

export const MovieHistoryGrid = ({
  movies,
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
  movies?: TraktMovieHistoryList;
  isLoading?: Grid.Props["isLoading"];
  emptyViewTitle?: Grid.EmptyView.Props["title"];
  searchBarPlaceholder?: Grid.Props["searchBarPlaceholder"];
  searchBarAccessory?: Grid.Props["searchBarAccessory"];
  pagination?: Grid.Props["pagination"];
  title: (movie: TraktMovieHistoryListItem) => string;
  subtitle: (movie: TraktMovieHistoryListItem) => string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (movie: TraktMovieHistoryListItem) => void;
}) => {
  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder={searchBarPlaceholder ?? "Search for movies"}
      searchBarAccessory={searchBarAccessory}
      pagination={pagination}
    >
      <Grid.EmptyView title={emptyViewTitle} />
      {movies &&
        movies.map((movie) => (
          <MovieHistoryGridItem
            key={movie.id}
            item={movie}
            title={title}
            subtitle={subtitle}
            primaryAction={primaryAction}
            primaryActionIcon={primaryActionIcon ?? Icon.Checkmark}
            primaryActionShortcut={primaryActionShortcut ?? Keyboard.Shortcut.Common.Edit}
            primaryActionTitle={primaryActionTitle ?? "Check-in Movie"}
          />
        ))}
    </Grid>
  );
};

export const ShowHistoryGrid = ({
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
  episodes?: TraktShowHistoryList;
  isLoading?: Grid.Props["isLoading"];
  emptyViewTitle?: Grid.EmptyView.Props["title"];
  searchBarPlaceholder?: Grid.Props["searchBarPlaceholder"];
  searchBarAccessory?: Grid.Props["searchBarAccessory"];
  pagination?: Grid.Props["pagination"];
  title: (episode: TraktShowHistoryListItem) => string;
  subtitle: (episode: TraktShowHistoryListItem) => string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (episode: TraktShowHistoryListItem) => void;
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
          <ShowHistoryGridItem
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
