import { Action, ActionPanel, Grid, Icon, Image, Keyboard } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { IMDB_APP_URL, TRAKT_APP_URL } from "../lib/constants";
import { getIMDbUrl, getPosterUrl, getTraktUrl } from "../lib/helper";
import { TraktShowListItem } from "../lib/schema";
import { SeasonGrid } from "./season-grid";

export const ShowGridItem = ({
  show,
  subtitle,
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
  show: TraktShowListItem;
  subtitle: (show: TraktShowListItem) => string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (show: TraktShowListItem) => void;
  secondaryActionTitle?: string;
  secondaryActionIcon?: Image.ImageLike;
  secondaryActionShortcut?: Keyboard.Shortcut;
  secondaryAction?: (show: TraktShowListItem) => void;
  tertiaryActionTitle?: string;
  tertiaryActionIcon?: Image.ImageLike;
  tertiaryActionShortcut?: Keyboard.Shortcut;
  tertiaryAction?: (show: TraktShowListItem) => void;
}) => {
  return (
    <Grid.Item
      key={show.show.ids.trakt}
      title={show.show.title}
      subtitle={subtitle(show)}
      content={getPosterUrl(show.show.images, "poster.png")}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser
              icon={getFavicon(TRAKT_APP_URL)}
              title="Open in Trakt"
              url={getTraktUrl("shows", show.show.ids.slug)}
            />
            <Action.OpenInBrowser
              icon={getFavicon(IMDB_APP_URL)}
              title="Open in IMDb"
              url={getIMDbUrl(show.show.ids.imdb)}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.Push
              icon={Icon.Switch}
              title="Seasons"
              shortcut={Keyboard.Shortcut.Common.Open}
              target={
                <SeasonGrid
                  showId={show.show.ids.trakt}
                  tmdbId={show.show.ids.tmdb}
                  slug={show.show.ids.slug}
                  imdbId={show.show.ids.imdb}
                />
              }
            />
            {primaryAction && primaryActionTitle && primaryActionIcon && primaryActionShortcut && (
              <Action
                icon={primaryActionIcon}
                title={primaryActionTitle}
                shortcut={primaryActionShortcut}
                onAction={() => primaryAction(show)}
              />
            )}
            {secondaryAction && secondaryActionTitle && secondaryActionIcon && secondaryActionShortcut && (
              <Action
                icon={Icon.Checkmark}
                title={secondaryActionTitle}
                shortcut={secondaryActionShortcut}
                onAction={() => secondaryAction(show)}
              />
            )}
            {tertiaryAction && tertiaryActionTitle && tertiaryActionIcon && tertiaryActionShortcut && (
              <Action
                icon={tertiaryActionIcon}
                title={tertiaryActionTitle}
                shortcut={tertiaryActionShortcut}
                onAction={() => tertiaryAction(show)}
              />
            )}
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
};
