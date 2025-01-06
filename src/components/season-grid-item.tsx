import { Action, ActionPanel, Grid, Icon, Keyboard } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { IMDB_APP_URL, TRAKT_APP_URL } from "../lib/constants";
import { getIMDbUrl, getPosterUrl, getTraktUrl } from "../lib/helper";
import { TraktSeasonListItem } from "../lib/schema";
import { EpisodeGrid } from "./episode-grid";

export const SeasonGridItem = ({
  season,
  tmdbId,
  slug,
  imdbId,
  showId,
}: {
  season: TraktSeasonListItem;
  tmdbId: number;
  slug: string;
  imdbId: string;
  showId: number;
}) => {
  return (
    <Grid.Item
      key={season.ids.trakt}
      title={season.title}
      subtitle={season.first_aired ? new Date(season.first_aired).getFullYear().toString() : "Not Aired"}
      content={getPosterUrl(season.images, "poster.png")}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser
              icon={getFavicon(TRAKT_APP_URL)}
              title="Open in Trakt"
              url={getTraktUrl("season", slug, season.number)}
            />
            <Action.OpenInBrowser
              icon={getFavicon(IMDB_APP_URL)}
              title="Open in IMDb"
              url={getIMDbUrl(imdbId, season.number)}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.Push
              icon={Icon.Switch}
              title="Episodes"
              shortcut={Keyboard.Shortcut.Common.Open}
              target={<EpisodeGrid showId={showId} tmdbId={tmdbId} seasonNumber={season.number} slug={slug} />}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
};
