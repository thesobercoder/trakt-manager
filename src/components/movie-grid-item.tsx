import { Action, ActionPanel, Grid, Icon, Image, Keyboard } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { getIMDbUrl, getPosterUrl, getTraktUrl } from "../lib/helper";
import { TraktMovieListItem } from "../lib/schema";

export const MovieGridItem = ({
  movie,
  primaryActionTitle,
  primaryActionIcon,
  primaryActionShortcut,
  primaryAction,
  secondaryActionTitle,
  secondaryActionIcon,
  secondaryActionShortcut,
  secondaryAction,
  tertiaryActionTitle,
  tertiaryActionIcon,
  tertiaryActionShortcut,
  tertiaryAction,
}: {
  movie: TraktMovieListItem;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (movie: TraktMovieListItem) => void;
  secondaryActionTitle?: string;
  secondaryActionIcon?: Image.ImageLike;
  secondaryActionShortcut?: Keyboard.Shortcut;
  secondaryAction?: (movie: TraktMovieListItem) => void;
  tertiaryActionTitle?: string;
  tertiaryActionIcon?: Image.ImageLike;
  tertiaryActionShortcut?: Keyboard.Shortcut;
  tertiaryAction?: (movie: TraktMovieListItem) => void;
}) => {
  return (
    <Grid.Item
      key={movie.movie.ids.trakt}
      title={movie.movie.title}
      subtitle={movie.movie.year?.toString() || ""}
      content={getPosterUrl(movie.movie.images, "poster.png")}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser
              icon={getFavicon("https://trakt.tv")}
              title="Open in Trakt"
              url={getTraktUrl("movie", movie.movie.ids.slug)}
            />
            <Action.OpenInBrowser
              icon={getFavicon("https://www.imdb.com")}
              title="Open in IMDb"
              url={getIMDbUrl(movie.movie.ids.imdb)}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            {primaryAction && primaryActionTitle && primaryActionIcon && primaryActionShortcut && (
              <Action
                icon={primaryActionIcon}
                title={primaryActionTitle}
                shortcut={primaryActionShortcut}
                onAction={() => primaryAction(movie)}
              />
            )}
            {secondaryAction && secondaryActionTitle && secondaryActionIcon && secondaryActionShortcut && (
              <Action
                icon={Icon.Checkmark}
                title={secondaryActionTitle}
                shortcut={secondaryActionShortcut}
                onAction={() => secondaryAction(movie)}
              />
            )}
            {tertiaryAction && tertiaryActionTitle && tertiaryActionIcon && tertiaryActionShortcut && (
              <Action
                icon={tertiaryActionIcon}
                title={tertiaryActionTitle}
                shortcut={tertiaryActionShortcut}
                onAction={() => tertiaryAction(movie)}
              />
            )}
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
};
