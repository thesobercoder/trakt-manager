import { Action, ActionPanel, Grid, Icon, Keyboard } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { TMDB_IMG_URL, TRAKT_APP_URL } from "../lib/constants";
import { TraktSeasonList } from "../lib/types";
import { getSeasons } from "../services/shows";
import { Episodes } from "./episodes";

export const Seasons = ({ traktId, tmdbId, slug }: { traktId: number; tmdbId: number; slug: string }) => {
  const abortable = useRef<AbortController>();
  const [seasons, setSeasons] = useState<TraktSeasonList | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setIsLoading(true);
      setSeasons(await getSeasons(traktId, tmdbId, abortable.current?.signal));
      setIsLoading(false);
      return () => {
        if (abortable.current) {
          abortable.current.abort();
        }
      };
    })();
  }, []);

  return (
    <Grid isLoading={isLoading} aspectRatio="9/16" fit={Grid.Fit.Fill} searchBarPlaceholder="Search for seasons">
      {seasons &&
        seasons.map((season) => {
          return (
            <Grid.Item
              key={season.ids.trakt}
              title={`${season.name ?? "Unknown Show"} ${season.air_date ? `(${new Date(season.air_date).getFullYear()})` : ""}`}
              content={`${season.poster_path ? `${TMDB_IMG_URL}/${season.poster_path}` : "poster.png"}`}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.Push
                      icon={Icon.Switch}
                      title="Episodes"
                      shortcut={Keyboard.Shortcut.Common.Open}
                      target={<Episodes traktId={traktId} tmdbId={tmdbId} seasonNumber={season.number} slug={slug} />}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <Action.OpenInBrowser
                      title="Open in Trakt"
                      url={`${TRAKT_APP_URL}/shows/${slug}/seasons/${season.number}`}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })}
    </Grid>
  );
};
