import { LocalStorage, getPreferenceValues } from "@raycast/api";
import fetch, { type Response } from "node-fetch";
import { TMDB_API_URL, TRAKT_API_URL, TRAKT_CLIENT_ID } from "../lib/constants";
import { oauthClient } from "../lib/oauth";
import { TMDBMovieDetails, TraktMovieList } from "../lib/types";

const checkCache = async (result: TraktMovieList, signal: AbortSignal | undefined) => {
  const cachedMoviesNotFound = new Array<number>();
  for (const movie of result) {
    const tmdbMovieCache = await LocalStorage.getItem<string>(`movie_${movie.movie.ids.tmdb}`);
    if (tmdbMovieCache) {
      const tmdbMovie = JSON.parse(tmdbMovieCache) as TMDBMovieDetails;
      movie.movie.poster_path = tmdbMovie.poster_path;
      continue;
    }
  }

  const preferences = getPreferenceValues<ExtensionPreferences>();
  if (preferences.apiKey) {
    const moviePromises = new Array<Promise<Response>>();

    for (const movie of cachedMoviesNotFound) {
      moviePromises.push(
        fetch(`${TMDB_API_URL}/movie/${movie}?api_key=${preferences.apiKey}`, {
          signal,
        }),
      );
    }

    if (moviePromises && moviePromises.length > 0) {
      const allMovies = await Promise.all(moviePromises);
      for (const movie of allMovies) {
        const tmdbMovie = (await movie.json()) as TMDBMovieDetails;
        await LocalStorage.setItem(`movie_${tmdbMovie.id}`, JSON.stringify(tmdbMovie));
        const traktShow = result.find((m) => m.movie.ids.tmdb === tmdbMovie.id);
        if (traktShow) {
          traktShow.movie.poster_path = tmdbMovie.poster_path;
        }
      }
    }
  }
};

export const searchMovies = async (query: string, page: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(
    `${TRAKT_API_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}&limit=5`,
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "trakt-api-version": "2",
        "trakt-api-key": TRAKT_CLIENT_ID,
        Authorization: `Bearer ${tokens?.accessToken}`,
      },
      signal,
    },
  );

  const result = (await response.json()) as TraktMovieList;
  result.page = Number(response.headers.get("X-Pagination-Page")) ?? 1;
  result.total_pages = Number(response.headers.get("X-Pagination-Page-Count")) ?? 1;
  result.total_results = Number(response.headers.get("X-Pagination-Item-Count")) ?? result.length;

  await checkCache(result, signal);

  return result;
};

export const getWatchlist = async (page: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/sync/watchlist/movies/added?page=${page}&limit=10`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const result = (await response.json()) as TraktMovieList;
  result.page = Number(response.headers.get("X-Pagination-Page")) ?? 1;
  result.total_pages = Number(response.headers.get("X-Pagination-Page-Count")) ?? 1;
  result.total_results = Number(response.headers.get("X-Pagination-Item-Count")) ?? result.length;

  await checkCache(result, signal);

  return result;
};

export const addMovieToWatchlist = async (movieId: number, signal: AbortSignal | undefined) => {
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
      movies: [
        {
          ids: {
            trakt: movieId,
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
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    body: JSON.stringify({
      movies: [
        {
          ids: {
            trakt: movieId,
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
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    body: JSON.stringify({
      movies: [
        {
          ids: {
            trakt: movieId,
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
