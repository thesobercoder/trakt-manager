import { Action, ActionPanel, Grid, Icon, Keyboard } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { getIMDbUrl, getScreenshotUrl, getTraktUrl } from "../lib/helper";
import { TraktEpisodeListItem } from "../lib/schema";

const formatter = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" });

export const EpisodeGridItem = ({
  episode,
  seasonNumber,
  slug,
  checkInEpisode,
}: {
  episode: TraktEpisodeListItem;
  seasonNumber: number;
  slug: string;
  checkInEpisode: (episode: TraktEpisodeListItem) => Promise<void>;
}) => {
  return (
    <Grid.Item
      key={episode.ids.trakt}
      title={`${episode.number}. ${episode.title}`}
      subtitle={formatter.format(new Date(episode.first_aired))}
      content={getScreenshotUrl(episode.images, "episode.png")}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser
              icon={getFavicon("https://trakt.tv")}
              title="Open in Trakt"
              url={getTraktUrl("episode", slug, seasonNumber, episode.number)}
            />
            <Action.OpenInBrowser
              icon={getFavicon("https://www.imdb.com")}
              title="Open in IMDb"
              url={getIMDbUrl(episode.ids.imdb)}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action
              icon={Icon.Checkmark}
              title="Check-in Episode"
              shortcut={Keyboard.Shortcut.Common.Edit}
              onAction={() => checkInEpisode(episode)}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
};
