import { Action, ActionPanel, Grid, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { AbortError } from "node-fetch";
import { useEffect, useRef, useState } from "react";
import { Seasons } from "./components/seasons";
import { View } from "./components/view";
import { TMDB_IMG_URL, TRAKT_APP_URL } from "./lib/constants";
import { Shows } from "./lib/types";
import { addShowToWatchlist, searchShows } from "./services/shows";

function SearchCommand() {
  const abortable = useRef<AbortController>();
  const [searchText, setSearchText] = useState<string | undefined>();
  const [shows, setMovies] = useState<Shows | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (abortable.current) {
        abortable.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (abortable.current) {
        abortable.current.abort();
      }
      abortable.current = new AbortController();
      if (!searchText) {
        setMovies(undefined);
      } else {
        setIsLoading(true);
        try {
          const shows = await searchShows(searchText, page, abortable.current.signal);
          setMovies(shows);
          setPage(shows.page);
          setTotalPages(shows.total_pages);
        } catch (e) {
          if (!(e instanceof AbortError)) {
            showToast({
              title: "Error searching shows",
              style: Toast.Style.Failure,
            });
          }
        }
        setIsLoading(false);
      }
    })();
  }, [searchText, page]);

  const onAddToWatchlist = async (id: number) => {
    setIsLoading(true);
    try {
      await addShowToWatchlist(id, abortable.current?.signal);
    } catch (e) {
      if (!(e instanceof AbortError)) {
        showToast({
          title: "Error adding show to watchlist",
          style: Toast.Style.Failure,
        });
      }
    }
    setIsLoading(false);
    showToast({
      title: "Show added to watchlist",
      style: Toast.Style.Success,
    });
  };

  return (
    <Grid
      isLoading={isLoading}
      aspectRatio="9/16"
      fit={Grid.Fit.Fill}
      searchBarPlaceholder="Search for shows"
      onSearchTextChange={(text) => {
        setSearchText(text);
        setPage(1);
        setTotalPages(1);
      }}
      throttle={true}
    >
      <Grid.EmptyView title="Search for shows" />
      {shows &&
        shows.results.map((show) => {
          return (
            <Grid.Item
              key={show.id}
              title={`${show.name ?? show.original_name ?? "Unknown Show"} (${new Date(show.first_air_date).getFullYear()})`}
              content={`${TMDB_IMG_URL}/${show.poster_path}`}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Seasons"
                    shortcut={Keyboard.Shortcut.Common.Open}
                    target={<Seasons id={show.id} />}
                  />
                  <Action.OpenInBrowser url={`${TRAKT_APP_URL}/search/tmdb/${show.id}?id_type=show`} />
                  <Action
                    title="Add To Watchlist"
                    shortcut={Keyboard.Shortcut.Common.Edit}
                    onAction={() => onAddToWatchlist(show.id)}
                  />
                  {/* <Action
                    title="Show Seasons"
                    shortcut={Keyboard.Shortcut.Common.Duplicate}
                    onAction={() => onCheckInMovie(movie.id)}
                  /> */}
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
              }
            />
          );
        })}
    </Grid>
  );
}

export default function Command() {
  return (
    <View>
      <SearchCommand />
    </View>
  );
}
