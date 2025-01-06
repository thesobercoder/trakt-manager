import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  TraktEpisodeList,
  TraktExtendedSchema,
  TraktIdSchema,
  TraktIdSchemaWithTime,
  TraktMovieHistoryList,
  TraktMovieList,
  TraktPaginationWithSortingSchema,
  TraktSearchSchema,
  TraktSeasonList,
  TraktShowHistoryList,
  TraktShowList,
  TraktUpNextQuerySchema,
} from "./schema";

const c = initContract();

const TraktMovieContract = c.router({
  searchMovies: {
    method: "GET",
    path: "/search/movie",
    responses: {
      200: TraktMovieList,
    },
    query: TraktSearchSchema,
    summary: "Search for movies",
  },
  getWatchlistMovies: {
    method: "GET",
    path: "/sync/watchlist/movies/added",
    responses: {
      200: TraktMovieList,
    },
    query: TraktPaginationWithSortingSchema,
    summary: "Get movies in watchlist",
  },
  addMovieToWatchlist: {
    method: "POST",
    path: "sync/watchlist",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      movies: z.array(TraktIdSchema),
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
      movies: z.array(TraktIdSchema),
    }),
    summary: "Remove movie from watchlist",
  },
  addMovieToHistory: {
    method: "POST",
    path: "/sync/history",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      movies: z.array(TraktIdSchemaWithTime),
    }),
    summary: "Add movie to history",
  },
  getMovieHistory: {
    method: "GET",
    path: "/sync/history/movies",
    responses: {
      200: TraktMovieHistoryList,
    },
    query: TraktPaginationWithSortingSchema,
    summary: "Get movie history",
  },
  removeMovieFromHistory: {
    method: "POST",
    path: "/sync/history/remove",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      movies: z.array(TraktIdSchema),
    }),
    summary: "Remove movie from history",
  },
});

const TraktShowContract = c.router({
  searchShows: {
    method: "GET",
    path: "/search/show",
    responses: {
      200: TraktShowList,
    },
    query: TraktSearchSchema,
    summary: "Search for shows",
  },
  getWatchlistShows: {
    method: "GET",
    path: "/sync/watchlist/shows/added",
    responses: {
      200: TraktShowList,
    },
    query: TraktPaginationWithSortingSchema,
    summary: "Get shows in watchlist",
  },
  addShowToWatchlist: {
    method: "POST",
    path: "sync/watchlist",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      shows: z.array(TraktIdSchema),
    }),
    summary: "Add show to watchlist",
  },
  removeShowFromWatchlist: {
    method: "POST",
    path: "/sync/watchlist/remove",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      shows: z.array(TraktIdSchema),
    }),
    summary: "Remove show from watchlist",
  },
  addShowToHistory: {
    method: "POST",
    path: "/sync/history",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      shows: z.array(TraktIdSchemaWithTime),
    }),
    summary: "Add show to history",
  },
  addEpisodeToHistory: {
    method: "POST",
    path: "/sync/history",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      episodes: z.array(TraktIdSchemaWithTime),
    }),
    summary: "Add episode to history",
  },
  getShowHistory: {
    method: "GET",
    path: "/sync/history/shows",
    responses: {
      200: TraktShowHistoryList,
    },
    query: TraktPaginationWithSortingSchema,
    summary: "Get show history",
  },
  removeShowFromHistory: {
    method: "POST",
    path: "/sync/history/remove",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      shows: z.array(TraktIdSchema),
    }),
    summary: "Remove show from history",
  },
  removeEpisodeFromHistory: {
    method: "POST",
    path: "/sync/history/remove",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      episodes: z.array(TraktIdSchema),
    }),
    summary: "Remove episode from history",
  },
  getEpisodes: {
    method: "GET",
    path: "/shows/:showid/seasons/:seasonNumber/episodes",
    responses: {
      200: TraktEpisodeList,
    },
    pathParams: z.object({
      showid: z.coerce.number(),
      seasonNumber: z.coerce.number(),
    }),
    query: TraktExtendedSchema,
    summary: "Get episodes for a season",
  },
  getSeasons: {
    method: "GET",
    path: "/shows/:showid/seasons",
    responses: {
      200: TraktSeasonList,
    },
    pathParams: z.object({
      showid: z.coerce.number(),
    }),
    query: TraktExtendedSchema,
    summary: "Get seasons for a show",
  },
  getUpNextShows: {
    method: "GET",
    path: "/sync/progress/up_next",
    responses: {
      200: TraktShowList,
    },
    query: TraktUpNextQuerySchema,
    summary: "Get up next shows",
  },
});

export const TraktContract = c.router(
  {
    movies: TraktMovieContract,
    shows: TraktShowContract,
  },
  {
    strictStatusCodes: true,
  },
);
