import { Action, ActionPanel, Grid, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import { AbortError } from "node-fetch";
import { useEffect, useRef, useState } from "react";
import { Seasons } from "./components/seasons";
import { View } from "./components/view";
import { IMDB_APP_URL, TMDB_IMG_URL, TRAKT_APP_URL } from "./lib/constants";
import { TraktShowList } from "./lib/types";
import { addShowToWatchlist, searchShows } from "./services/shows";

function SearchCommand() {
  const abortable = useRef<AbortController>();
  const [searchText, setSearchText] = useState<string | undefined>();
  const [shows, setMovies] = useState<TraktShowList | undefined>();
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

  const onAddToWatchlist = async (showId: number) => {
    setIsLoading(true);
    try {
      await addShowToWatchlist(showId, abortable.current?.signal);
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
        shows.map((show) => {
          return (
            <Grid.Item
              key={show.show.ids.trakt}
              title={`${show.show.title ?? "Unknown Show"} ${show.show.year ? `(${show.show.year})` : ""}`}
              content={`${show.show.poster_path ? `${TMDB_IMG_URL}/${show.show.poster_path}` : "poster.png"}`}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <Action.OpenInBrowser title="Open in Trakt" url={`${TRAKT_APP_URL}/shows/${show.show.ids.slug}`} />
                    <Action.OpenInBrowser title="Open in IMDb" url={`${IMDB_APP_URL}/${show.show.ids.imdb}`} />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    <Action.Push
                      icon={Icon.Switch}
                      title="Seasons"
                      shortcut={Keyboard.Shortcut.Common.Open}
                      target={
                        <Seasons
                          traktId={show.show.ids.trakt}
                          tmdbId={show.show.ids.tmdb}
                          slug={show.show.ids.slug}
                          imdbId={show.show.ids.imdb}
                        />
                      }
                    />
                    <Action
                      icon={Icon.Bookmark}
                      title="Add To Watchlist"
                      shortcut={Keyboard.Shortcut.Common.Edit}
                      onAction={() => onAddToWatchlist(show.show.ids.trakt)}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section>
                    {page === totalPages ? null : (
                      <Action
                        icon={Icon.ArrowRight}
                        title="Next Page"
                        shortcut={{ modifiers: ["cmd"], key: "arrowRight" }}
                        onAction={() => setPage((page) => (page + 1 > totalPages ? totalPages : page + 1))}
                      />
                    )}
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
