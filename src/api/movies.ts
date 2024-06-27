import fetch from "node-fetch";
import { TRAKT_API_URL, TRAKT_CLIENT_ID } from "../lib/constants";
import { oauthProvider } from "../lib/oauth";

export const searchMovies = async (query: string, page: number, signal: AbortSignal | undefined = undefined) => {
  const url = `${TRAKT_API_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}&limit=10&fields=title`;
  console.log("searchMovies:", url);

  const accessToken = await oauthProvider.authorize();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  });

  if (!response.ok) {
    console.error("searchMovies:", await response.text());
    throw new Error(response.statusText);
  }

  const result = (await response.json()) as TraktMovieList;
  const slicedResult = result.slice(0, 10) as TraktMovieList;

  slicedResult.page = Number(response.headers.get("X-Pagination-Page")) ?? 1;
  slicedResult.total_pages = Number(response.headers.get("X-Pagination-Page-Count")) ?? 1;
  slicedResult.total_results = Number(response.headers.get("X-Pagination-Item-Count")) ?? result.length;

  return slicedResult as TraktMovieList;
};

export const getWatchlistMovies = async (page: number, signal: AbortSignal | undefined = undefined) => {
  const url = `${TRAKT_API_URL}/sync/watchlist/movies/added?page=${page}&limit=10`;
  console.log("getWatchlistMovies:", url);

  const accessToken = await oauthProvider.authorize();
  const response = await fetch(`${TRAKT_API_URL}/sync/watchlist/movies/added?page=${page}&limit=10`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  });

  if (!response.ok) {
    console.error("getWatchlistMovies:", await response.text());
    throw new Error(response.statusText);
  }

  const result = (await response.json()) as TraktMovieList;
  result.page = Number(response.headers.get("X-Pagination-Page")) ?? 1;
  result.total_pages = Number(response.headers.get("X-Pagination-Page-Count")) ?? 1;
  result.total_results = Number(response.headers.get("X-Pagination-Item-Count")) ?? result.length;

  return result;
};

export const addMovieToWatchlist = async (movieId: number, signal: AbortSignal | undefined = undefined) => {
  const url = `${TRAKT_API_URL}/sync/watchlist`;
  console.log("addMovieToWatchlist:", url);

  const accessToken = await oauthProvider.authorize();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
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
    console.error("addMovieToWatchlist:", await response.text());
    throw new Error(response.statusText);
  }
};

export const removeMovieFromWatchlist = async (movieId: number, signal: AbortSignal | undefined = undefined) => {
  const url = `${TRAKT_API_URL}/sync/watchlist/remove`;
  console.log("removeMovieFromWatchlist:", url);

  const accessToken = await oauthProvider.authorize();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
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
    console.error("removeMovieFromWatchlist:", await response.text());
    throw new Error(response.statusText);
  }
};

export const checkInMovie = async (movieId: number, signal: AbortSignal | undefined = undefined) => {
  const url = `${TRAKT_API_URL}/checkin`;
  console.log("checkInMovie:", url);

  const accessToken = await oauthProvider.authorize();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      movie: {
        ids: {
          trakt: movieId,
        },
      },
    }),
    signal,
  });

  if (!response.ok) {
    console.error("checkInMovie:", await response.text());
    throw new Error(response.statusText);
  }
};

export const addMovieToHistory = async (movieId: number, signal: AbortSignal | undefined = undefined) => {
  const url = `${TRAKT_API_URL}/sync/history`;
  console.log("addMovieToHistory:", url);

  const accessToken = await oauthProvider.authorize();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
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
    console.error("addMovieToHistory:", await response.text());
    throw new Error(response.statusText);
  }
};

export const getHistoryMovies = async (page: number, signal: AbortSignal | undefined = undefined) => {
  const url = `${TRAKT_API_URL}/sync/watched/movies`;
  console.log("getHistoryMovies:", url);

  const accessToken = await oauthProvider.authorize();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  });

  if (!response.ok) {
    console.error("getHistoryMovies:", await response.text());
    throw new Error(response.statusText);
  }

  const result = (await response.json()) as TraktMovieList;
  result.sort((a, b) => {
    const dateA = new Date(a.last_watched_at || 0);
    const dateB = new Date(b.last_watched_at || 0);
    return dateB.getTime() - dateA.getTime();
  });

  const pageSize = 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageResult = result.slice(startIndex, endIndex) as TraktMovieList;

  pageResult.page = page;
  pageResult.total_pages = Math.floor(result.length / pageSize);
  pageResult.total_results = result.length;

  return pageResult;
};

export const removeMovieFromHistory = async (movieId: number, signal: AbortSignal | undefined = undefined) => {
  const url = `${TRAKT_API_URL}/sync/history/remove`;
  console.log("removeMovieFromHistory:", url);

  const accessToken = await oauthProvider.authorize();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
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
    console.error("removeMovieFromHistory:", await response.text());
    throw new Error(response.statusText);
  }
};
