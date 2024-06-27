import { Image, Keyboard } from "@raycast/api";
import { ShowGridItem } from "./show-grid-item";

export const ShowGridItems = ({
  shows,
  subtitle,
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
  shows: TraktShowList | undefined;
  subtitle: (show: TraktShowListItem) => string;
  primaryActionTitle?: string;
  primaryActionIcon?: Image.ImageLike;
  primaryActionShortcut?: Keyboard.Shortcut;
  primaryAction?: (show: TraktShowListItem) => void;
  secondaryActionTitle?: string;
  secondaryActionIcon?: Image.ImageLike;
  secondaryActionShortcut?: Keyboard.Shortcut;
  secondaryAction?: (show: TraktShowListItem) => void;
  tertiaryActionTitle?: string;
  tertiaryActionIcon?: Image.ImageLike;
  tertiaryActionShortcut?: Keyboard.Shortcut;
  tertiaryAction?: (show: TraktShowListItem) => void;
}) => {
  if (!shows) return null;

  return (
    <>
      {shows.map((show) => {
        return (
          <ShowGridItem
            key={show.show.ids.trakt}
            show={show}
            subtitle={subtitle}
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
