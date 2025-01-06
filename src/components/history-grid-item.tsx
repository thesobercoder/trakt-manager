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
          {primaryAction && primaryActionTitle && primaryActionIcon && primaryActionShortcut && (
            <ActionPanel.Section>
              <Action
                icon={primaryActionIcon}
                title={primaryActionTitle}
                shortcut={primaryActionShortcut}
                onAction={() => primaryAction(item)}
              />
            </ActionPanel.Section>
          )}
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
}) => {
  return (
    <HistoryGridItem
      item={item}
      title={title(item)}
      subtitle={subtitle(item)}
      imageUrl={getPosterUrl(item.show.images, "poster.png")}
      traktUrl={getTraktUrl("movies", item.show.ids.slug)}
      imdbUrl={getIMDbUrl(item.show.ids.imdb)}
      primaryAction={() => props.primaryAction?.(item)}
      {...props}
    />
  );
};
