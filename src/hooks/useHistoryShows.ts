import { AbortError } from "node-fetch";
import { MutableRefObject, useState } from "react";
import { removeShowFromHistory } from "../api/shows";

export const useHistoryShows = (abortable: MutableRefObject<AbortController | undefined>) => {
  const [error, setError] = useState<Error | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const removeShowFromHistoryMutation = async (show: TraktShowListItem) => {
    try {
      await removeShowFromHistory(show.show.ids.trakt, abortable.current?.signal);
      setSuccess("Show removed from history");
    } catch (e) {
      if (!(e instanceof AbortError)) {
        setError(e as Error);
      }
    }
  };

  return { removeShowFromHistoryMutation, error, success };
};
