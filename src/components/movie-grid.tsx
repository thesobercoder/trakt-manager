import { Action, ActionPanel, Grid, Icon, Image, Keyboard } from "@raycast/api";
import { SetStateAction } from "react";
import { IMDB_APP_URL, TMDB_IMG_URL, TRAKT_APP_URL } from "../lib/constants";

export const MovieGrid = ({
  movies,
  watchlistActionTitle,
  watchlistIcon,
  watchlistActionShortcut,
  watchlistAction,
  checkInActionTitle,
  checkinAction,
  page,
  totalPages,
  setPage,
}: {
  movies: TraktMovieList | undefined;
  watchlistActionTitle: string;
  watchlistIcon: Image.ImageLike;
  watchlistActionShortcut: Keyboard.Shortcut;
  watchlistAction: (traktId: number) => void;
  checkInActionTitle: string;
  checkinAction: (traktId: number) => void;
  page: number;
  totalPages: number;
  setPage: (value: SetStateAction<number>) => void;
}) => {
  if (!movies) return null;

  return (
    <>
      <Grid.Section title={`Page ${page}`}>
        {movies.map((movie) => (
          <Grid.Item
            key={movie.id}
            title={`${movie.movie.title} ${movie.movie.year ? `(${movie.movie.year})` : ""}`}
            content={`${movie.movie.details?.poster_path ? `${TMDB_IMG_URL}/${movie.movie.details.poster_path}` : "poster.png"}`}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action.OpenInBrowser title="Open in Trakt" url={`${TRAKT_APP_URL}/movies/${movie.movie.ids.slug}`} />
                  <Action.OpenInBrowser title="Open in IMDb" url={`${IMDB_APP_URL}/${movie.movie.ids.imdb}`} />
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <Action
                    icon={watchlistIcon}
                    title={watchlistActionTitle}
                    shortcut={watchlistActionShortcut}
                    onAction={() => watchlistAction(movie.movie.ids.trakt)}
                  />
                  <Action
                    icon={Icon.Checkmark}
                    title={checkInActionTitle}
                    shortcut={Keyboard.Shortcut.Common.Duplicate}
                    onAction={() => checkinAction(movie.movie.ids.trakt)}
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
        ))}
      </Grid.Section>
    </>
  );
};