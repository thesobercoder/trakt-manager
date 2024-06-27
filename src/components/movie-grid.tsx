import { Image, Keyboard } from "@raycast/api";
import { MovieGridItem } from "./movie-grid-item";

export const MovieGridItems = ({
  movies,
  primaryActionTitle,
  primaryActionIcon,
  primaryActionShortcut,
  primaryAction,
  secondaryActionTitle,
  secondaryActionIcon,
  secondaryActionShortcut,
  secondaryAction,
  tertiaryActionTitle,
  tertiaryActionIcon,
  tertiaryActionShortcut,
  tertiaryAction,
}: {
  movies: TraktMovieList | undefined | never[];
  movieDetails: Map<number, TMDBMovieDetails | undefined>;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (movie: TraktMovieListItem) => void;
  secondaryActionTitle?: string;
  secondaryActionIcon?: Image.ImageLike;
  secondaryActionShortcut?: Keyboard.Shortcut;
  secondaryAction?: (movie: TraktMovieListItem) => void;
  tertiaryActionTitle?: string;
  tertiaryActionIcon?: Image.ImageLike;
  tertiaryActionShortcut?: Keyboard.Shortcut;
  tertiaryAction?: (movie: TraktMovieListItem) => void;
}) => {
  return (
    <>
      {movies?.map((movie) => {
        return (
          <MovieGridItem
            key={movie.movie.ids.trakt}
            movie={movie}
            primaryActionTitle={primaryActionTitle}
            primaryActionIcon={primaryActionIcon}
            primaryActionShortcut={primaryActionShortcut}
            primaryAction={primaryAction}
            secondaryActionTitle={secondaryActionTitle}
            secondaryActionIcon={secondaryActionIcon}
            secondaryActionShortcut={secondaryActionShortcut}
            secondaryAction={secondaryAction}
            tertiaryActionTitle={tertiaryActionTitle}
            tertiaryActionIcon={tertiaryActionIcon}
            tertiaryActionShortcut={tertiaryActionShortcut}
            tertiaryAction={tertiaryAction}
          />
        );
      })}
    </>
  );
};
