import { Movie } from "./types";
import { API_URL, CLIENT_ID } from "./constants";
import { isAuthorized, oauthClient } from "./oauth";
import fetch from "node-fetch";

export const searchMovies = async (query: string) => {
  if (!await isAuthorized()) {
    return;
  }

  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${API_URL}/search/movie?query=${query}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      "Authorization": `Bearer ${tokens?.accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Search movies:", await response.text());
    throw new Error(response.statusText);
  }

  return await response.json() as Movie[];
};

export const addToWatchlist = async (id: number) => {
  if (!await isAuthorized()) {
    return;
  }

  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${API_URL}/sync/watchlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      "Authorization": `Bearer ${tokens?.accessToken}`,
    },
    body: JSON.stringify({
      movies: [
        {
          ids: {
            trakt: id,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error("Add to watchlist:", await response.text());
    throw new Error(response.statusText);
  }
};
