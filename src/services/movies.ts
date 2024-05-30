import { LocalStorage, getPreferenceValues } from "@raycast/api";
import fetch, { type Response } from "node-fetch";
import { CLIENT_ID, TMDB_API_URL, TRAKT_API_URL } from "../lib/constants";
import { oauthClient } from "../lib/oauth";
import { MovieDetails, MovieWatchlist, Movies } from "../lib/types";

export const searchMovies = async (query: string, page: number = 1, signal: AbortSignal | undefined) => {
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

export const addMovieToWatchlist = async (movieId: number, signal: AbortSignal | undefined) => {
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
            tmdb: movieId,
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

export const removeMovieFromWatchlist = async (movieId: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/sync/watchlist/remove`, {
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
            tmdb: movieId,
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

export const checkInMovie = async (movieId: number, signal: AbortSignal | undefined) => {
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
            tmdb: movieId,
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

export const getWatchlist = async (page: number = 1, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/sync/watchlist/movies/added?page=${page}&limit=10`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const result = (await response.json()) as MovieWatchlist;
  result.page = Number(response.headers.get("X-Pagination-Page")) ?? 1;
  result.total_pages = Number(response.headers.get("X-Pagination-Page-Count")) ?? 1;
  result.total_results = Number(response.headers.get("X-Pagination-Item-Count")) ?? 1;

  const posterPromises = new Array<Promise<Response>>();
  const preferences = getPreferenceValues<ExtensionPreferences>();
  if (preferences.apiKey) {
    for (const movie of result) {
      const poster = await LocalStorage.getItem<string>(`${movie.movie.ids.tmdb}`);
      if (poster) {
        movie.movie.poster_path = poster;
        continue;
      }
      posterPromises.push(
        fetch(`${TMDB_API_URL}/movie/${movie.movie.ids.tmdb}?api_key=${preferences.apiKey}`, {
          signal,
        }),
      );
    }

    if (posterPromises && posterPromises.length > 0) {
      const posters = await Promise.all(posterPromises);
      for (const movie of posters) {
        const poster = (await movie.json()) as MovieDetails;
        const traktMovie = result.find((m) => m.movie.ids.tmdb === poster.id);
        if (traktMovie) {
          traktMovie.movie.poster_path = poster.poster_path;
          await LocalStorage.setItem(`${traktMovie.movie.ids.tmdb}`, poster.poster_path);
        }
      }
    }
  }

  return result;
};
