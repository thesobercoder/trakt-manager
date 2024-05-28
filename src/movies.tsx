import { Action, ActionPanel, Keyboard, List, showToast, Toast } from "@raycast/api";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { View } from "./components/view";
import { Movie } from "./lib/types";
import { addMovieToWatchlist, getMoviePoster, searchMovies } from "./services/movies";

function SearchCommand() {
  const [searchText, setSearchText] = useState<string | undefined>();
  const [movies, setMovies] = useState<Movie[] | undefined>();
  const [poster, setPoster] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelecteMovie] = useState<string | null>();
  const debouncedSelectedMovie = useDebounce(selectedMovie, 300);

  useEffect(() => {
    if (!searchText) {
      setMovies(undefined);
    }
  }, [searchText]);

  const onSearch = async () => {
    if (searchText) {
      setIsLoading(true);
      const items = await searchMovies(searchText);
      setMovies(items);
      setIsLoading(false);
    }
  };

  const onAddToWatchlist = async (id: number) => {
    setIsLoading(true);
    await addMovieToWatchlist(id);
    setIsLoading(false);
    showToast({
      title: "Movie added to watchlist",
      style: Toast.Style.Success,
    });
  };

  const checkInMovie = async (id: number) => {
    setIsLoading(true);
    await checkInMovie(id);
    setIsLoading(false);
    showToast({
      title: "Movie checked in",
      style: Toast.Style.Success,
    });
  };

  const onSelectionChange = async (id: string | null) => {
    setSelecteMovie(id);
  };

  useEffect(() => {
    (async () => {
      if (debouncedSelectedMovie) {
        setIsLoading(true);
        setPoster(await getMoviePoster(debouncedSelectedMovie));
        setIsLoading(false);
      }
    })();
  }, [selectedMovie]);

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      onSelectionChange={onSelectionChange}
      throttle={true}
      isShowingDetail
      actions={
        <ActionPanel>
          <Action title="Search" shortcut={Keyboard.Shortcut.Common.Open} onAction={onSearch} />
        </ActionPanel>
      }
    >
      <List.EmptyView title="Search for movies" />
      {movies &&
        movies.map((m) => {
          const baseMarkdown = `<img src="poster.png" width="120"/>`;
          const realMarkdown = `<img src="${poster}" width="120"/>`;

          return (
            <List.Item
              id={`${m.movie.ids.trakt}`}
              key={m.movie.ids.trakt}
              icon="trakt.png"
              title={m.movie.title}
              actions={
                <ActionPanel>
                  <Action
                    title="Add To Watchlist"
                    shortcut={Keyboard.Shortcut.Common.Open}
                    onAction={() => onAddToWatchlist(m.movie.ids.trakt)}
                  />
                  <Action
                    title="Checkin Movie"
                    shortcut={Keyboard.Shortcut.Common.Edit}
                    onAction={() => checkInMovie(m.movie.ids.trakt)}
                  />
                  <Action.OpenInBrowser
                    url={`https://trakt.tv/movies/${m.movie.ids.slug}`}
                    shortcut={Keyboard.Shortcut.Common.Duplicate}
                    title="Trakt"
                  />
                  <Action.OpenInBrowser
                    url={`https://www.imdb.com/title/${m.movie.ids.imdb}`}
                    shortcut={Keyboard.Shortcut.Common.New}
                    title="IMDb"
                  />
                </ActionPanel>
              }
              detail={
                <List.Item.Detail
                  markdown={poster ? realMarkdown : baseMarkdown}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label title="Name" text={m.movie.title} />
                      <List.Item.Detail.Metadata.Label title="Year" text={String(m.movie.year || "")} />
                    </List.Item.Detail.Metadata>
                  }
                />
              }
            />
          );
        })}
    </List>
  );
}

export default function Command() {
  return (
    <View>
      <SearchCommand />
    </View>
  );
}
