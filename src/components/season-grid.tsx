import { Grid, showToast, Toast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { setMaxListeners } from "node:events";
import { useRef } from "react";
import { initTraktClient } from "../lib/client";
import { APP_MAX_LISTENERS } from "../lib/constants";
import { SeasonGridItem } from "./season-grid-item";

export const SeasonGrid = ({
  showId,
  tmdbId,
  slug,
  imdbId,
}: {
  showId: number;
  tmdbId: number;
  slug: string;
  imdbId: string;
}) => {
  const abortable = useRef<AbortController>();
  const traktClient = initTraktClient();
  const { isLoading, data: seasons } = useCachedPromise(
    async (showId: number) => {
      abortable.current = new AbortController();
      setMaxListeners(APP_MAX_LISTENERS, abortable.current?.signal);

      const response = await traktClient.shows.getSeasons({
        query: { extended: "full" },
        params: { showid: showId },
        fetchOptions: { signal: abortable.current.signal },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch seasons");
      }

      return response.body;
    },
    [showId],
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

  return (
    <Grid isLoading={isLoading} aspectRatio="9/16" fit={Grid.Fit.Fill} searchBarPlaceholder="Search for seasons">
      {seasons &&
        seasons.map((season) => (
          <SeasonGridItem
            key={season.ids.trakt}
            season={season}
            tmdbId={tmdbId}
            slug={slug}
            imdbId={imdbId}
            showId={showId}
          />
        ))}
    </Grid>
  );
};
