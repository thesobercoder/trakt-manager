import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";
import { CLIENT_ID, TMDB_API_URL, TRAKT_API_URL } from "../lib/constants";
import { oauthClient } from "../lib/oauth";
import { ShowDetails, Shows } from "../lib/types";

export const searchShows = async (query: string, page: number, signal: AbortSignal | undefined) => {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const response = await fetch(
    `${TMDB_API_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}&api_key=${preferences.apiKey}`,
    {
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return (await response.json()) as Shows;
};

export const getShowSeasons = async (id: number, signal: AbortSignal | undefined) => {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const response = await fetch(`${TMDB_API_URL}/tv/${encodeURIComponent(id)}?api_key=${preferences.apiKey}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return (await response.json()) as ShowDetails;
};

export const addShowToWatchlist = async (id: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/sync/watchlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    body: JSON.stringify({
      shows: [
        {
          ids: {
            tmdb: id,
          },
        },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
};
