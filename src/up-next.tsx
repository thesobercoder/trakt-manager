import { Action, ActionPanel, Grid, Icon, Keyboard, Toast, showToast } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { useEffect } from "react";
import { Seasons } from "./components/seasons";
import { useUpNextShows } from "./hooks/useUpNextShows";
import { getIMDbUrl, getPosterUrl, getTraktUrl } from "./lib/helper";

export default function Command() {
  const { isLoading, shows, onCheckInNextEpisode, error, success } = useUpNextShows();

  useEffect(() => {
    if (error) {
      showToast({
        title: error.message,
        style: Toast.Style.Failure,
      });
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      showToast({
        title: success,
        style: Toast.Style.Success,
      });
    }
  }, [success]);

  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for shows that are up next"
      throttle={true}
    >
      {shows &&
        shows.map((show) => (
          <Grid.Item
            title={show.show.title}
            subtitle={`${show.show.progress?.next_episode?.season}x${show.show.progress?.next_episode?.number.toString().padStart(2, "0")}`}
            content={getPosterUrl(show.show.details?.poster_path, "poster.png")}
            key={show.show.ids.trakt}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action.OpenInBrowser
                    icon={getFavicon("https://trakt.tv")}
                    title="Open in Trakt"
                    url={getTraktUrl("shows", show.show.ids.slug)}
                  />
                  <Action.OpenInBrowser
                    icon={getFavicon("https://www.imdb.com")}
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
                      <Seasons
                        traktId={show.show.ids.trakt}
                        tmdbId={show.show.ids.tmdb}
                        slug={show.show.ids.slug}
                        imdbId={show.show.ids.imdb}
                      />
                    }
                  />
                  <Action
                    icon={Icon.Checkmark}
                    title={"Check-in Next Episode"}
                    shortcut={Keyboard.Shortcut.Common.Edit}
                    onAction={() =>
                      onCheckInNextEpisode(show.show.progress?.next_episode?.ids.trakt, show.show.ids.trakt)
                    }
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))}
    </Grid>
  );
}
