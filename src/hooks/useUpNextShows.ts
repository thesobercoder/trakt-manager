import { AbortError } from "node-fetch";
import { MutableRefObject, useState } from "react";
import { checkInEpisode, updateShowProgress } from "../api/shows";

export function useUpNextShows(abortable: MutableRefObject<AbortController | undefined>) {
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const checkInNextEpisodeMutation = async (show: TraktShowListItem) => {
    if (show.show.progress?.next_episode) {
      try {
        await checkInEpisode(show.show.progress?.next_episode.ids.trakt, abortable.current?.signal);
        await updateShowProgress(show.show.ids.trakt, abortable.current?.signal);
        setSuccess("Episode checked in");
      } catch (e) {
        if (!(e instanceof AbortError)) {
          setError(e as Error);
        }
      }
    }
  };

  return { checkInNextEpisodeMutation, error, success };
}
