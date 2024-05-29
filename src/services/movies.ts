import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";
import { CLIENT_ID, TMDB_API_URL, TRAKT_API_URL } from "../lib/constants";
import { oauthClient } from "../lib/oauth";
import { Movies } from "../lib/types";

export const searchMovies = async (query: string, page: number, signal: AbortSignal | undefined) => {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const response = await fetch(
    `${TMDB_API_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}&api_key=${preferences.apiKey}`,
    {
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return (await response.json()) as Movies;
};

export const addMovieToWatchlist = async (id: number, signal: AbortSignal | undefined) => {
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
      movies: [
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

export const checkInMovie = async (id: number, signal: AbortSignal | undefined) => {
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
      movies: [
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
