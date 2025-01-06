import { Action, ActionPanel, Grid, Image, Keyboard } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { getIMDbUrl, getPosterUrl, getTraktUrl } from "../lib/helper";
import { TraktMovieHistoryListItem, TraktShowHistoryListItem } from "../lib/schema";

function isShowHistoryItem(
  item: TraktShowHistoryListItem | TraktMovieHistoryListItem,
): item is TraktShowHistoryListItem {
  return "show" in item && "episode" in item;
}

export const HistoryGridItem = ({
  item,
  title,
  subtitle,
  primaryActionTitle,
  primaryActionIcon,
  primaryActionShortcut,
  primaryAction,
}: {
  item: TraktShowHistoryListItem | TraktMovieHistoryListItem;
  title: (show: TraktShowHistoryListItem | TraktMovieHistoryListItem) => string;
  subtitle: (show: TraktShowHistoryListItem | TraktMovieHistoryListItem) => string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (show: TraktShowHistoryListItem | TraktMovieHistoryListItem) => void;
}) => {
  return (
    <Grid.Item
      key={item.id}
      title={title(item)}
      subtitle={subtitle(item)}
      content={getPosterUrl(isShowHistoryItem(item) ? item.show.images : item.movie.images, "poster.png")}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser
              icon={getFavicon("https://app.trakt.tv")}
              title="Open in Trakt"
              url={
                isShowHistoryItem(item)
                  ? getTraktUrl("episode", item.show.ids.slug, item.episode.season, item.episode.number)
                  : getTraktUrl("movies", item.movie.ids.slug)
              }
            />
            <Action.OpenInBrowser
              icon={getFavicon("https://www.imdb.com")}
              title="Open in IMDb"
              url={getIMDbUrl(isShowHistoryItem(item) ? item.episode.ids.imdb : item.movie.ids.imdb)}
            />
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
