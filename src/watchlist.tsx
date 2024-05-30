import { Action, ActionPanel, Grid, Icon } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { View } from "./components/view";
import { TMDB_IMG_URL, TRAKT_APP_URL } from "./lib/constants";
import { MovieWatchlist } from "./lib/types";
import { getWatchlist } from "./services/movies";

const WatchlistCommand = () => {
  const abortable = useRef<AbortController>();
  const [watchlist, setWatchlist] = useState<MovieWatchlist | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    (async () => {
      abortable.current = new AbortController();
      setIsLoading(true);
      const movieWatchlist = await getWatchlist(page, abortable.current?.signal);
      setWatchlist(movieWatchlist);
      setPage(movieWatchlist.page);
      setTotalPages(movieWatchlist.total_pages);
      setIsLoading(false);
      return () => {
        if (abortable.current) {
          abortable.current.abort();
        }
      };
    })();
  }, [page]);

  return (
    <Grid isLoading={isLoading} aspectRatio="9/16" fit={Grid.Fit.Fill} searchBarPlaceholder="Search watchlist">
      {watchlist &&
        watchlist.map((movie) => {
          return (
            <Grid.Item
              key={movie.id}
              title={`${movie.movie.title ?? "Unknown Movie"} (${movie.movie.year})`}
              content={`${TMDB_IMG_URL}/${movie.movie.poster_path}`}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser url={`${TRAKT_APP_URL}/movies/${movie.movie.ids.trakt}`} />
                  <ActionPanel.Section>
                    <Action
                      icon={Icon.ArrowRight}
                      title="Next Page"
                      shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
                      onAction={() => setPage((page) => (page + 1 > totalPages ? totalPages : page + 1))}
                    />
                    {page > 1 ? (
                      <Action
                        icon={Icon.ArrowLeft}
                        title="Previous Page"
                        shortcut={{ modifiers: ["cmd"], key: "arrowLeft" }}
                        onAction={() => setPage((page) => (page - 1 < 1 ? 1 : page - 1))}
                      />
                    ) : null}
                  </ActionPanel.Section>
                </ActionPanel>
                // <ActionPanel>
                //   <Action.Push
                //     title="Episodes"
                //     shortcut={Keyboard.Shortcut.Common.Open}
                //     target={<Episodes showId={showId} seasonNumber={season.season_number} />}
                //   />
                //   <Action.OpenInBrowser url={`${TRAKT_APP_URL}/search/tmdb/${showId}?id_type=show`} />
                // </ActionPanel>
              }
            />
          );
        })}
    </Grid>
  );
};

export default function Command() {
  return (
    <View>
      <WatchlistCommand />
    </View>
  );
}
