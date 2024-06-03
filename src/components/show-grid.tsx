import { Action, ActionPanel, Grid, Icon, Image, Keyboard } from "@raycast/api";
import { SetStateAction } from "react";
import { IMDB_APP_URL, TMDB_IMG_URL, TRAKT_APP_URL } from "../lib/constants";
import { Seasons } from "./seasons";

export const ShowGrid = ({
  shows,
  watchlistActionTitle,
  watchlistIcon,
  watchlistActionShortcut,
  watchlistAction,
  page,
  totalPages,
  setPage,
}: {
  shows: TraktShowList | undefined;
  watchlistActionTitle: string;
  watchlistIcon: Image.ImageLike;
  watchlistActionShortcut: Keyboard.Shortcut;
  watchlistAction: (traktId: number) => void;
  page: number;
  totalPages: number;
  setPage: (value: SetStateAction<number>) => void;
}) => {
  if (!shows) return null;

  return (
    <>
      <Grid.Section title={`Page ${page}`}>
        {shows.map((show) => (
          <Grid.Item
            key={show.id}
            title={`${show.show.title} ${show.show.year ? `(${show.show.year})` : ""}`}
            content={`${show.show.details?.poster_path ? `${TMDB_IMG_URL}/${show.show.details.poster_path}` : "poster.png"}`}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action.OpenInBrowser title="Open in Trakt" url={`${TRAKT_APP_URL}/movies/${show.show.ids.slug}`} />
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
                    icon={watchlistIcon}
                    title={watchlistActionTitle}
                    shortcut={watchlistActionShortcut}
                    onAction={() => watchlistAction(show.show.ids.trakt)}
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
