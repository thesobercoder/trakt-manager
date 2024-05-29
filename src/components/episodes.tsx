import { Action, ActionPanel, Grid } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { TMDB_IMG_URL, TRAKT_APP_URL } from "../lib/constants";
import { EpisodeDetails } from "../lib/types";
import { getSeasonEpisodes } from "../services/shows";

export const Episodes = ({ showId, seasonNumber }: { showId: number; seasonNumber: number }) => {
  const abortable = useRef<AbortController>();
  const [seasons, setSeasons] = useState<EpisodeDetails | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setIsLoading(true);
      setSeasons(await getSeasonEpisodes(showId, seasonNumber, abortable.current?.signal));
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
      columns={3}
      aspectRatio="16/9"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for episodes"
    >
      {seasons &&
        seasons.episodes.map((episode) => {
          return (
            <Grid.Item
              key={episode.id}
              title={`${episode.episode_number}. ${episode.name ?? "Unknown Episode"}`}
              content={`${TMDB_IMG_URL}/${episode.still_path}`}
              actions={
                <ActionPanel>
                  {/* <Action.Push
                    title="Episodes"
                    shortcut={Keyboard.Shortcut.Common.Open}
                    target={<Episodes showId={showId} seasonNumber={season.season_number} />}
                  /> */}
                  <Action.OpenInBrowser url={`${TRAKT_APP_URL}/search/tmdb/${episode.id}?id_type=episode`} />
                </ActionPanel>
              }
            />
          );
        })}
    </Grid>
  );
};
