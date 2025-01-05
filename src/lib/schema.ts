import { z } from "zod";

export const TraktMovieListItem = z.object({
  type: z.string(),
  score: z.number(),
  plays: z.number().optional(),
  last_watched_at: z.string().optional(),
  last_updated_at: z.string().optional(),
  movie: z.object({
    title: z.string(),
    year: z.number().optional(),
    ids: z.object({
      trakt: z.number(),
      slug: z.string(),
      imdb: z.string(),
      tmdb: z.number(),
    }),
  }),
});

export const TraktMovieList = z.array(TraktMovieListItem);

const TraktShowProgress = z.object({
  aired: z.number(),
  completed: z.number(),
  last_watched_at: z.string(),
  reset_at: z.string().optional(),
  seasons: z.array(
    z.object({
      number: z.number(),
      title: z.string(),
      aired: z.number(),
      completed: z.number(),
      episodes: z.array(
        z.object({
          number: z.number(),
          completed: z.boolean(),
          last_watched_at: z.string().optional(),
        }),
      ),
    }),
  ),
  hidden_seasons: z.array(
    z.object({
      number: z.number(),
      ids: z.object({
        trakt: z.number(),
        tvdb: z.number(),
        tmdb: z.number(),
      }),
    }),
  ),
  next_episode: z
    .object({
      season: z.number(),
      number: z.number(),
      title: z.string(),
      ids: z.object({
        trakt: z.number(),
        tvdb: z.number(),
        imdb: z.string(),
        tmdb: z.number(),
      }),
    })
    .optional(),
  last_episode: z.object({
    season: z.number(),
    number: z.number(),
    title: z.string(),
    ids: z.object({
      trakt: z.number(),
      tvdb: z.number(),
      imdb: z.string(),
      tmdb: z.number(),
    }),
  }),
});

export const TraktShowListItem = z.object({
  type: z.string(),
  score: z.number(),
  plays: z.number().optional(),
  last_watched_at: z.string().optional(),
  last_updated_at: z.string().optional(),
  show: z.object({
    title: z.string(),
    year: z.number().optional(),
    progress: TraktShowProgress.optional(),
    ids: z.object({
      trakt: z.number(),
      slug: z.string(),
      tvdb: z.number(),
      imdb: z.string(),
      tmdb: z.number(),
    }),
  }),
});

export const TraktShowList = z.array(TraktShowListItem);

export const TraktSeasonListItem = z.object({
  number: z.number(),
  ids: z.object({
    trakt: z.number(),
    tvdb: z.number(),
    tmdb: z.number(),
  }),
  rating: z.number(),
  votes: z.number(),
  episode_count: z.number(),
  aired_episodes: z.number(),
  title: z.string(),
  overview: z.string().optional(),
  first_aired: z.string().optional(),
  udpated_at: z.string(),
  network: z.string(),
});

export const TraktSeasonList = z.array(TraktSeasonListItem);

export const TraktEpisodeListItem = z.object({
  season: z.number(),
  number: z.number(),
  title: z.string(),
  ids: z.object({
    trakt: z.number(),
    tvdb: z.number(),
    imdb: z.string(),
    tmdb: z.number(),
  }),
  number_abs: z.number().optional(),
  overview: z.string().optional(),
  rating: z.number(),
  votes: z.number(),
  comment_count: z.number(),
  first_aired: z.string(),
  updated_at: z.string(),
  available_translations: z.array(z.string()),
  runtime: z.number(),
  episode_type: z.string(),
});

export const TraktEpisodeList = z.array(TraktEpisodeListItem);

export type TraktMovieListItem = z.infer<typeof TraktMovieListItem>;
export type TraktMovieList = z.infer<typeof TraktMovieList>;
export type TraktShowListItem = z.infer<typeof TraktShowListItem>;
export type TraktShowList = z.infer<typeof TraktShowList>;
export type TraktSeasonListItem = z.infer<typeof TraktSeasonListItem>;
export type TraktSeasonList = z.infer<typeof TraktSeasonList>;
export type TraktEpisodeListItem = z.infer<typeof TraktEpisodeListItem>;
export type TraktEpisodeList = z.infer<typeof TraktEpisodeList>;

export const TraktPaginationSchema = z.object({
  "x-pagination-page": z.coerce.number().default(0),
  "x-pagination-limit": z.coerce.number().default(0),
  "x-pagination-page-count": z.coerce.number().default(0),
  "x-pagination-item-count": z.coerce.number().default(0),
});

export const withPagination = <T>(args: { status: number; body: T; headers: Headers }) => {
  const parsedHeaders = TraktPaginationSchema.parse(args.headers);

  return {
    data: args.body as T,
    pagination: parsedHeaders,
  };
};
