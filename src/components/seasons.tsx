import { Grid } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { TMDB_IMG_URL } from "../lib/constants";
import { ShowDetails } from "../lib/types";
import { getShowSeasons } from "../services/shows";

export const Seasons = ({ id }: { id: number }) => {
  const abortable = useRef<AbortController>();
  const [seasons, setSeasons] = useState<ShowDetails | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setIsLoading(true);
      const showDetails = await getShowSeasons(id, abortable.current?.signal);
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
            />
          );
        })}
    </Grid>
  );
};
