import { Grid, Toast, showToast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { setMaxListeners } from "node:events";
import { useCallback, useRef, useState } from "react";
import { initTraktClient } from "../lib/client";
import { APP_MAX_LISTENERS } from "../lib/constants";
import { TraktEpisodeListItem } from "../lib/schema";
import { EpisodeGridItem } from "./episode-grid-item";

export const EpisodeGrid = ({
  showId,
  seasonNumber,
  slug,
}: {
  showId: number;
  tmdbId: number;
  seasonNumber: number;
  slug: string;
}) => {
  const abortable = useRef<AbortController>();
  const traktClient = initTraktClient();
  const [actionLoading, setActionLoading] = useState(false);
  const { isLoading, data: episodes } = useCachedPromise(
    async (showId: number, seasonNumber: number) => {
      abortable.current = new AbortController();
      setMaxListeners(APP_MAX_LISTENERS, abortable.current?.signal);

      const response = await traktClient.shows.getEpisodes({
        query: { extended: "full,cloud9" },
        params: { showid: showId, seasonNumber: seasonNumber },
        fetchOptions: { signal: abortable.current.signal },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch seasons");
      }

      return response.body;
    },
    [showId, seasonNumber],
    {
      initialData: undefined,
      keepPreviousData: true,
      abortable,
      onError(error) {
        showToast({
          title: error.message,
          style: Toast.Style.Failure,
        });
      },
    },
  );

  const checkInEpisode = useCallback(async (episode: TraktEpisodeListItem) => {
    await traktClient.shows.checkInEpisode({
      body: {
        episode: [
          {
            ids: {
              trakt: episode.ids.trakt,
            },
          },
        ],
      },
    });
  }, []);

  const handleAction = useCallback(
    async (
      episode: TraktEpisodeListItem,
      action: (episode: TraktEpisodeListItem) => Promise<void>,
      message: string,
    ) => {
      setActionLoading(true);
      try {
        await action(episode);
        showToast({
          title: message,
          style: Toast.Style.Success,
        });
      } catch (e) {
        showToast({
          title: (e as Error).message,
          style: Toast.Style.Failure,
        });
      } finally {
        setActionLoading(false);
      }
    },
    [],
  );

  return (
    <Grid
      isLoading={isLoading || actionLoading}
      columns={3}
      aspectRatio="16/9"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for episodes"
    >
      {episodes &&
        episodes.map((episode) => (
          <EpisodeGridItem
            key={episode.ids.trakt}
            episode={episode}
            seasonNumber={seasonNumber}
            slug={slug}
            checkInEpisode={() => handleAction(episode, checkInEpisode, "Checked in")}
          />
        ))}
    </Grid>
  );
};
