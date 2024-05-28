import { LocalStorage } from "@raycast/api";
import { load } from "cheerio";
import fetch from "node-fetch";
import { API_URL, CLIENT_ID, POSTER_URL } from "../lib/constants";
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
    throw new Error(response.statusText);
  }
};

export const getMoviePoster = async (id: string, signal: AbortSignal | undefined) => {
  const cachedPoster = await LocalStorage.getItem(id);

  if (cachedPoster && typeof cachedPoster === "string") {
    return cachedPoster;
  }

  const response = await fetch(`${POSTER_URL}/movie/${id}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const html = await response.text();
  const $ = load(html);
  const poster = $(".poster.w-full").attr("src");
  if (poster) {
    await LocalStorage.setItem(id, poster);
  }

  return poster;
};
