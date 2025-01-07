import { Action, ActionPanel, Grid, Image, Keyboard } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { IMDB_APP_URL, TRAKT_APP_URL } from "../lib/constants";
import { getIMDbUrl, getPosterUrl, getTraktUrl } from "../lib/helper";
import { TraktMovieHistoryListItem, TraktShowHistoryListItem } from "../lib/schema";

const HistoryGridItem = <T extends TraktMovieHistoryListItem | TraktShowHistoryListItem>({
  item,
  title,
  subtitle,
  imageUrl,
  traktUrl,
  imdbUrl,
  primaryActionTitle,
  primaryActionIcon,
  primaryActionShortcut,
  primaryAction,
  secondaryActionTitle,
  secondaryActionIcon,
  secondaryActionShortcut,
  secondaryAction,
}: {
  item: T;
  title: string;
  subtitle: string;
  imageUrl: string;
  traktUrl: string;
  imdbUrl: string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (item: T) => void;
  secondaryActionTitle?: string;
  secondaryActionIcon?: Image.ImageLike;
  secondaryActionShortcut?: Keyboard.Shortcut;
  secondaryAction?: (movie: T) => void;
}) => {
  return (
    <Grid.Item
      key={item.id}
      title={title}
      subtitle={subtitle}
      content={imageUrl}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser icon={getFavicon(TRAKT_APP_URL)} title="Open in Trakt" url={traktUrl} />
            <Action.OpenInBrowser icon={getFavicon(IMDB_APP_URL)} title="Open in IMDb" url={imdbUrl} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            {primaryAction && primaryActionTitle && primaryActionIcon && primaryActionShortcut && (
              <Action
                icon={primaryActionIcon}
                title={primaryActionTitle}
                shortcut={primaryActionShortcut}
                onAction={() => primaryAction(item)}
              />
            )}
            {secondaryAction && secondaryActionTitle && secondaryActionIcon && secondaryActionShortcut && (
              <Action
                icon={secondaryActionIcon}
                title={secondaryActionTitle}
                shortcut={secondaryActionShortcut}
                onAction={() => secondaryAction(item)}
              />
            )}
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
};

export const MovieHistoryGridItem = ({
  item,
  title,
  subtitle,
  ...props
}: {
  item: TraktMovieHistoryListItem;
  title: (item: TraktMovieHistoryListItem) => string;
  subtitle: (item: TraktMovieHistoryListItem) => string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (item: TraktMovieHistoryListItem) => void;
  secondaryActionTitle?: string;
  secondaryActionIcon?: Image.ImageLike;
  secondaryActionShortcut?: Keyboard.Shortcut;
  secondaryAction?: (movie: TraktMovieHistoryListItem) => void;
}) => {
  return (
    <HistoryGridItem
      item={item}
      title={title(item)}
      subtitle={subtitle(item)}
      imageUrl={getPosterUrl(item.movie.images, "poster.png")}
      traktUrl={getTraktUrl("movies", item.movie.ids.slug)}
      imdbUrl={getIMDbUrl(item.movie.ids.imdb)}
      primaryAction={() => props.primaryAction?.(item)}
      secondaryAction={() => props.secondaryAction?.(item)}
      {...props}
    />
  );
};

export const ShowHistoryGridItem = ({
  item,
  title,
  subtitle,
  ...props
}: {
  item: TraktShowHistoryListItem;
  title: (item: TraktShowHistoryListItem) => string;
  subtitle: (item: TraktShowHistoryListItem) => string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (item: TraktShowHistoryListItem) => void;
  secondaryActionTitle?: string;
  secondaryActionIcon?: Image.ImageLike;
  secondaryActionShortcut?: Keyboard.Shortcut;
  secondaryAction?: (movie: TraktShowHistoryListItem) => void;
}) => {
  return (
    <HistoryGridItem
      item={item}
      title={title(item)}
      subtitle={subtitle(item)}
      imageUrl={getPosterUrl(item.show.images, "poster.png")}
      traktUrl={getTraktUrl("episode", item.show.ids.slug, item.episode.season, item.episode.number)}
      imdbUrl={getIMDbUrl(item.episode.ids.imdb)}
      primaryAction={() => props.primaryAction?.(item)}
      secondaryAction={() => props.secondaryAction?.(item)}
      {...props}
    />
  );
};
