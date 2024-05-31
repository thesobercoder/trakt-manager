import { Action, ActionPanel, Grid, Keyboard } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { TMDB_IMG_URL, TRAKT_APP_URL } from "../lib/constants";
import { TraktSeasonList } from "../lib/types";
import { getSeasons } from "../services/shows";
import { Episodes } from "./episodes";

export const Seasons = ({ traktId, tmdbId }: { traktId: number; tmdbId: number }) => {
  const abortable = useRef<AbortController>();
  const [seasons, setSeasons] = useState<TraktSeasonList | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setIsLoading(true);
      const showDetails = await getSeasons(traktId, tmdbId, 1, abortable.current?.signal);
      setSeasons(showDetails);
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
              title={`${season.name ?? "Unknown Season"} (${new Date(season.air_date).getFullYear()})`}
              content={`${TMDB_IMG_URL}/${season.poster_path}`}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Episodes"
                    shortcut={Keyboard.Shortcut.Common.Open}
                    target={<Episodes showId={season.ids.trakt} seasonNumber={season.number} />}
                  />
                  <Action.OpenInBrowser url={`${TRAKT_APP_URL}/shows/${season.ids.trakt}/seasons/${season.number}`} />
                </ActionPanel>
              }
            />
          );
        })}
    </Grid>
  );
};
