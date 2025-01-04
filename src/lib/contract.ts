import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { TraktMovieListSchema } from "./schema";

const c = initContract();

const TraktMovieContract = c.router({
  searchMovies: {
    method: "GET",
    path: "/search/movie",
    responses: {
      200: TraktMovieListSchema,
    },
    query: z.object({
      query: z.string(),
      page: z.number().default(1),
      limit: z.number().default(10),
      fields: z.string().default("title"),
    }),
    summary: "Search for movies",
  },
  getWatchlistMovies: {
    method: "GET",
    path: "/sync/watchlist/movies/added",
    responses: {
      200: TraktMovieListSchema,
    },
    query: z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
    }),
    summary: "Get movies in watchlist",
  },
  addMovieToWatchlist: {
    method: "POST",
    path: "sync/watchlist",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      movies: z.array(
        z.object({
          ids: z.object({
            trakt: z.number(),
          }),
        }),
      ),
    }),
    summary: "Add movie to watchlist",
  },
  removeMovieFromWatchlist: {
    method: "POST",
    path: "/sync/watchlist/remove",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      movies: z.array(
        z.object({
          ids: z.object({
            trakt: z.number(),
          }),
        }),
      ),
    }),
    summary: "Remove movie from watchlist",
  },
  checkInMovie: {
    method: "POST",
    path: "/checkin",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      movies: z.array(
        z.object({
          ids: z.object({
            trakt: z.number(),
          }),
        }),
      ),
    }),
    summary: "Check-in movie",
  },
  addMovieToHistory: {
    method: "POST",
    path: "/sync/history",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      movies: z.array(
        z.object({
          ids: z.object({
            trakt: z.number(),
          }),
        }),
      ),
    }),
    summary: "Add movie to history",
  },
  getMovieHistory: {
    method: "GET",
    path: "/sync/history/movies",
    responses: {
      200: TraktMovieListSchema,
    },
    query: z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
    }),
    summary: "Add movie to history",
  },
  removeMovieFromHistory: {
    method: "POST",
    path: "/sync/history/remove",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      movies: z.array(
        z.object({
          ids: z.object({
            trakt: z.number(),
          }),
        }),
      ),
    }),
    summary: "Remove movie from history",
  },
});

export const TraktContract = c.router({
  movies: TraktMovieContract,
});
