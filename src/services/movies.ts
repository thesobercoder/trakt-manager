import { load } from "cheerio";
import fetch from "node-fetch";
import { API_URL, APP_URL, CLIENT_ID } from "../lib/constants";
import { oauthClient } from "../lib/oauth";
import { Movie } from "../lib/types";

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
    console.error("Add movie to watchlist:", await response.text());
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

export const getMoviePoster = async (id: string, signal: AbortSignal | undefined) => {
  const response = await fetch(`${APP_URL}/movies/${id}`, {
    signal,
  });

  if (!response.ok) {
    console.error("Get movie poster:", await response.text());
    throw new Error(response.statusText);
  }

  const html = await response.text();
  const $ = load(html);
  const poster = $(".poster.with-overflow .real").attr("data-original");

  return poster;
};
