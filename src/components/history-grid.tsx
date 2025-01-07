import { Grid, Image, Keyboard } from "@raycast/api";
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
  throttle,
  onSearchTextChange,
  searchBarPlaceholder,
  searchBarAccessory,
  pagination,
  title,
  subtitle,
  primaryActionTitle,
  primaryActionIcon,
  primaryActionShortcut,
  primaryAction,
  secondaryActionTitle,
  secondaryActionIcon,
  secondaryActionShortcut,
  secondaryAction,
}: {
  movies?: TraktMovieHistoryList;
  isLoading?: Grid.Props["isLoading"];
  emptyViewTitle?: Grid.EmptyView.Props["title"];
  throttle?: Grid.Props["throttle"];
  onSearchTextChange?: (text: string) => void;
  searchBarPlaceholder?: Grid.Props["searchBarPlaceholder"];
  searchBarAccessory?: Grid.Props["searchBarAccessory"];
  pagination?: Grid.Props["pagination"];
  title: (movie: TraktMovieHistoryListItem) => string;
  subtitle: (movie: TraktMovieHistoryListItem) => string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (movie: TraktMovieHistoryListItem) => void;
  secondaryActionTitle?: string;
  secondaryActionIcon?: Image.ImageLike;
  secondaryActionShortcut?: Keyboard.Shortcut;
  secondaryAction?: (movie: TraktMovieHistoryListItem) => void;
}) => {
  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      throttle={throttle}
      onSearchTextChange={onSearchTextChange}
      searchBarPlaceholder={searchBarPlaceholder}
      searchBarAccessory={searchBarAccessory}
      pagination={pagination}
    >
      <Grid.EmptyView title={emptyViewTitle} />
      {movies &&
        movies.map((movie, index) => (
          <MovieHistoryGridItem
            key={`${movie.movie.ids.trakt}-${index}`}
            item={movie}
            title={title}
            subtitle={subtitle}
            primaryAction={primaryAction}
            primaryActionIcon={primaryActionIcon}
            primaryActionShortcut={primaryActionShortcut}
            primaryActionTitle={primaryActionTitle}
            secondaryAction={secondaryAction}
            secondaryActionIcon={secondaryActionIcon}
            secondaryActionShortcut={secondaryActionShortcut}
            secondaryActionTitle={secondaryActionTitle}
          />
        ))}
    </Grid>
  );
};

export const ShowHistoryGrid = ({
  episodes,
  isLoading,
  emptyViewTitle,
  throttle,
  onSearchTextChange,
  searchBarPlaceholder,
  searchBarAccessory,
  pagination,
  title,
  subtitle,
  primaryActionTitle,
  primaryActionIcon,
  primaryActionShortcut,
  primaryAction,
  secondaryActionTitle,
  secondaryActionIcon,
  secondaryActionShortcut,
  secondaryAction,
}: {
  episodes?: TraktShowHistoryList;
  isLoading?: Grid.Props["isLoading"];
  emptyViewTitle?: Grid.EmptyView.Props["title"];
  throttle?: Grid.Props["throttle"];
  onSearchTextChange?: (text: string) => void;
  searchBarPlaceholder?: Grid.Props["searchBarPlaceholder"];
  searchBarAccessory?: Grid.Props["searchBarAccessory"];
  pagination?: Grid.Props["pagination"];
  title: (episode: TraktShowHistoryListItem) => string;
  subtitle: (episode: TraktShowHistoryListItem) => string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (episode: TraktShowHistoryListItem) => void;
  secondaryActionTitle?: string;
  secondaryActionIcon?: Image.ImageLike;
  secondaryActionShortcut?: Keyboard.Shortcut;
  secondaryAction?: (movie: TraktShowHistoryListItem) => void;
}) => {
  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      throttle={throttle}
      onSearchTextChange={onSearchTextChange}
      searchBarPlaceholder={searchBarPlaceholder}
      searchBarAccessory={searchBarAccessory}
      pagination={pagination}
    >
      <Grid.EmptyView title={emptyViewTitle} />
      {episodes &&
        episodes.map((episode, index) => (
          <ShowHistoryGridItem
            key={`${episode.episode.ids.trakt}-${index}`}
            item={episode}
            title={title}
            subtitle={subtitle}
            primaryAction={primaryAction}
            primaryActionIcon={primaryActionIcon}
            primaryActionShortcut={primaryActionShortcut}
            primaryActionTitle={primaryActionTitle}
            secondaryAction={secondaryAction}
            secondaryActionIcon={secondaryActionIcon}
            secondaryActionShortcut={secondaryActionShortcut}
            secondaryActionTitle={secondaryActionTitle}
          />
        ))}
    </Grid>
  );
};
