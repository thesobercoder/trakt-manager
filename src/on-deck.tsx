import { Action, ActionPanel, Grid, Icon, Keyboard, Toast, openExtensionPreferences, showToast } from "@raycast/api";
import { setMaxListeners } from "events";
import { AbortError } from "node-fetch";
import { useEffect, useRef, useState } from "react";
import { Seasons } from "./components/seasons";
import { View } from "./components/view";
import { IMDB_APP_URL, TMDB_IMG_URL, TRAKT_APP_URL } from "./lib/constants";
import { getOnDeckItems } from "./services/shows";
import { getTMDBShowDetails } from "./services/tmdb";

const OnDeckCommand = () => {
  const abortable = useRef<AbortController>();
  const [isLoading, setIsLoading] = useState(false);
  const [shows, setShows] = useState<TraktOnDeckList | undefined>();

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setMaxListeners(100, abortable.current?.signal);
      setIsLoading(true);

      try {
        const shows = await getOnDeckItems(abortable.current?.signal);
        setShows(shows);

        const showsWithImages = (await Promise.all(
          shows.map(async (show) => {
            show.show.details = await getTMDBShowDetails(show.show.ids.tmdb, abortable.current?.signal);
            return show;
          }),
        )) as TraktOnDeckList;

        setShows(showsWithImages);
      } catch (e) {
        if (!(e instanceof AbortError)) {
          showToast({
            title: "Error getting on deck shows",
            style: Toast.Style.Failure,
          });
        }
      }
      setIsLoading(false);
      return () => {
        if (abortable.current) {
          abortable.current.abort();
        }
      };
    })();
  }, []);

  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for shows currently on deck"
      throttle={true}
    >
      {shows &&
        shows.map((show) => (
          <Grid.Item
            title={show.show.title}
            subtitle={`${show.show.progress?.next_episode?.season}x${show.show.progress?.next_episode?.number.toString().padStart(2, "0")}`}
            content={`${show.show.details?.poster_path ? `${TMDB_IMG_URL}/${show.show.details.poster_path}` : "poster.png"}`}
            key={show.show.ids.trakt}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action.OpenInBrowser title="Open in Trakt" url={`${TRAKT_APP_URL}/shows/${show.show.ids.slug}`} />
                  <Action.OpenInBrowser title="Open in IMDb" url={`${IMDB_APP_URL}/${show.show.ids.imdb}`} />
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
                    onAction={() => {}}
                  />
                  <Action
                    icon={Icon.Cog}
                    title="Open Extension Preferences"
                    onAction={openExtensionPreferences}
                    shortcut={Keyboard.Shortcut.Common.Pin}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))}
    </Grid>
  );
};

export default function Command() {
  return (
    <View>
      <OnDeckCommand />
    </View>
  );
}
