import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";
import { TMDB_API_URL, TRAKT_API_URL, TRAKT_CLIENT_ID } from "../lib/constants";
import { oauthClient } from "../lib/oauth";
import { EpisodeDetails, ShowDetails, Shows } from "../lib/types";

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

export const getShowSeasons = async (showId: number, signal: AbortSignal | undefined) => {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const response = await fetch(`${TMDB_API_URL}/tv/${encodeURIComponent(showId)}?api_key=${preferences.apiKey}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return (await response.json()) as ShowDetails;
};

export const getSeasonEpisodes = async (showId: number, seasonNumber: number, signal: AbortSignal | undefined) => {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const response = await fetch(
    `${TMDB_API_URL}/tv/${encodeURIComponent(showId)}/season/${seasonNumber}?api_key=${preferences.apiKey}`,
    {
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return (await response.json()) as EpisodeDetails;
};

export const addShowToWatchlist = async (showId: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/sync/watchlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    body: JSON.stringify({
      shows: [
        {
          ids: {
            tmdb: showId,
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
