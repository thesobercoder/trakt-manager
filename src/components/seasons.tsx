import { Action, ActionPanel, Grid, Keyboard } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { TMDB_IMG_URL, TRAKT_APP_URL } from "../lib/constants";
import { ShowDetails } from "../lib/types";
import { getShowSeasons } from "../services/shows";
import { Episodes } from "./episodes";

export const Seasons = ({ showId }: { showId: number }) => {
  const abortable = useRef<AbortController>();
  const [seasons, setSeasons] = useState<ShowDetails | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setIsLoading(true);
      const showDetails = await getShowSeasons(showId, abortable.current?.signal);
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
    <Grid isLoading={isLoading} aspectRatio="9/16" fit={Grid.Fit.Fill} searchBarPlaceholder="Search for shows">
      {seasons &&
        seasons.seasons.map((season) => {
          return (
            <Grid.Item
              key={season.id}
              title={`${season.name ?? "Unknown Season"} (${new Date(season.air_date).getFullYear()})`}
              content={`${TMDB_IMG_URL}/${season.poster_path}`}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Episodes"
                    shortcut={Keyboard.Shortcut.Common.Open}
                    target={<Episodes showId={showId} seasonNumber={season.season_number} />}
                  />
                  <Action.OpenInBrowser url={`${TRAKT_APP_URL}/search/tmdb/${showId}?id_type=show`} />
                </ActionPanel>
              }
            />
          );
        })}
    </Grid>
  );
};
