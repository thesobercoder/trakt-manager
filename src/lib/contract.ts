import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { TraktEpisodeList, TraktMovieList, TraktSeasonList, TraktShowList } from "./schema";

const c = initContract();

const PaginationSchema = z.object({
  page: z.coerce.number(),
  limit: z.coerce.number(),
});

const ExtendedSchema = z.object({
  extended: z.enum(["full", "cloud9", "full,cloud9"]),
});

const SearchSchema = PaginationSchema.extend({
  query: z.string(),
  fields: z.enum(["title"]),
}).merge(ExtendedSchema);

const TraktIdSchema = z.object({
  ids: z.object({
    trakt: z.number(),
  }),
});

const HistoryQuerySchema = PaginationSchema.merge(ExtendedSchema);

const TraktMovieContract = c.router({
  searchMovies: {
    method: "GET",
    path: "/search/movie",
    responses: {
      200: TraktMovieList,
    },
    query: SearchSchema,
    summary: "Search for movies",
  },
  getWatchlistMovies: {
    method: "GET",
    path: "/sync/watchlist/movies/added",
    responses: {
      200: TraktMovieList,
    },
    query: HistoryQuerySchema,
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
  checkInMovie: {
    method: "POST",
    path: "/checkin",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      movies: z.array(TraktIdSchema),
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
      movies: z.array(TraktIdSchema),
    }),
    summary: "Add movie to history",
  },
  getMovieHistory: {
    method: "GET",
    path: "/sync/history/movies",
    responses: {
      200: TraktMovieList,
    },
    query: HistoryQuerySchema,
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
    query: SearchSchema,
    summary: "Search for shows",
  },
  getWatchlistShows: {
    method: "GET",
    path: "/sync/watchlist/shows/added",
    responses: {
      200: TraktShowList,
    },
    query: HistoryQuerySchema,
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
  checkInEpisode: {
    method: "POST",
    path: "/checkin",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      episode: z.array(TraktIdSchema),
    }),
    summary: "Check-in episode",
  },
  addShowToHistory: {
    method: "POST",
    path: "/sync/history",
    responses: {
      200: c.type<unknown>(),
    },
    body: z.object({
      shows: z.array(TraktIdSchema),
    }),
    summary: "Add show to history",
  },
  getShowHistory: {
    method: "GET",
    path: "/sync/history/shows",
    responses: {
      200: TraktMovieList,
    },
    query: HistoryQuerySchema,
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
    query: ExtendedSchema,
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
    query: ExtendedSchema,
    summary: "Get seasons for a show",
  },
  getUpNextShows: {
    method: "GET",
    path: "/sync/progress/up_next",
    responses: {
      200: TraktShowList,
    },
    query: z.object({
      page: z.coerce.number(),
      limit: z.coerce.number(),
      sort_by: z.enum(["added"]),
      sort_how: z.enum(["asc", "desc"]),
      extended: z.enum(["full", "cloud9", "full,cloud9"]),
    }),
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
