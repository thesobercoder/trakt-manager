import { Action, ActionPanel, Grid } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { TMDB_IMG_URL, TRAKT_APP_URL } from "../lib/constants";
import { TraktEpisodeList } from "../lib/types";
import { getEpisodes } from "../services/shows";

export const Episodes = ({
  traktId,
  tmdbId,
  seasonNumber,
  slug,
}: {
  traktId: number;
  tmdbId: number;
  seasonNumber: number;
  slug: string;
}) => {
  const abortable = useRef<AbortController>();
  const [episodes, setSeasons] = useState<TraktEpisodeList | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setIsLoading(true);
      setSeasons(await getEpisodes(traktId, tmdbId, seasonNumber, abortable.current?.signal));
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
      {episodes &&
        episodes.map((episode) => {
          return (
            <Grid.Item
              key={episode.ids.trakt}
              title={`${episode.title ?? "Unknown Episode"}`}
              content={`${episode.poster_path ? `${TMDB_IMG_URL}/${episode.poster_path}` : "poster.png"}`}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.OpenInBrowser
                      title="Open in Trakt"
                      url={`${TRAKT_APP_URL}/shows/${slug}/seasons/${seasonNumber}/episodes/${episode.number}`}
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
