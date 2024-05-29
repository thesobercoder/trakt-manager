import fetch from "node-fetch";
import { CLIENT_ID, TRAKT_API_URL } from "../lib/constants";
import { oauthClient } from "../lib/oauth";
import { Season, Show } from "../lib/types";

export const searchShows = async (query: string) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/search/show?query=${encodeURIComponent(query)}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return (await response.json()) as Show[];
};

export const getShowSeasons = async (id: number) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/shows/${encodeURIComponent(id)}/seasons`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return (await response.json()) as Season[];
};

export const addShowToWatchlist = async (id: number) => {
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
            trakt: id,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
};
