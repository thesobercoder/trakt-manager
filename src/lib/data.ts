import fetch from "node-fetch";
import { API_URL, CLIENT_ID } from "./constants";
import { oauthClient } from "./oauth";
import { Movie, Season, Show } from "./types";

export const searchMovies = async (query: string) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${API_URL}/search/movie?query=${encodeURIComponent(query)}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Search movies:", await response.text());
    throw new Error(response.statusText);
  }

  return (await response.json()) as Movie[];
};

export const addMovieToWatchlist = async (id: number) => {
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

export const checkInMovie = async (id: number) => {
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
    console.error("Checkin movie:", await response.text());
    throw new Error(response.statusText);
  }
};

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
