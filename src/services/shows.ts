import fetch from "node-fetch";
import { API_URL, CLIENT_ID } from "../lib/constants";
import { oauthClient } from "../lib/oauth";
import { Season, Show } from "../lib/types";

export const searchShows = async (query: string) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${API_URL}/search/show?query=${encodeURIComponent(query)}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Search shows:", await response.text());
    throw new Error(response.statusText);
  }

  return (await response.json()) as Show[];
};

export const getShowSeasons = async (id: number) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${API_URL}/shows/${encodeURIComponent(id)}/seasons`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Get show seasons:", await response.text());
    throw new Error(response.statusText);
  }

  return (await response.json()) as Season[];
};

export const addShowToWatchlist = async (id: number) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${API_URL}/sync/watchlist`, {
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
    console.error("Add show to watchlist:", await response.text());
    throw new Error(response.statusText);
  }
};
