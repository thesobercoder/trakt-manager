import { z } from "zod";

export const MovieDetailsSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  belongs_to_collection: z.string(),
  budget: z.number(),
  genres: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    }),
  ),
  homepage: z.string(),
  id: z.number(),
  imdb_id: z.string(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().optional(),
  production_companies: z.array(
    z.object({
      id: z.number(),
      logo_path: z.string(),
      name: z.string(),
      origin_country: z.string(),
    }),
  ),
  production_countries: z.array(
    z.object({
      iso_3166_1: z.string(),
      name: z.string(),
    }),
  ),
  release_date: z.string(),
  revenue: z.number(),
  runtime: z.number(),
  spoken_languages: z.array(
    z.object({
      english_name: z.string(),
      iso_639_1: z.string(),
      name: z.string(),
    }),
  ),
  status: z.string(),
  tagline: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});

export const ShowDetailsSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string(),
  created_by: z.array(
    z.object({
      id: z.number(),
      credit_id: z.string(),
      name: z.string(),
      gender: z.number(),
      profile_path: z.string().optional(),
    }),
  ),
  episode_run_time: z.array(z.number()),
  first_air_date: z.string(),
  genres: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    }),
  ),
  homepage: z.string(),
  id: z.number(),
  in_production: z.boolean(),
  languages: z.array(z.string()),
  last_air_date: z.string(),
  last_episode_to_air: z.object({
    id: z.number(),
    overview: z.string(),
    name: z.string(),
    vote_average: z.number(),
    vote_count: z.number(),
    air_date: z.string(),
    episode_number: z.number(),
    episode_type: z.string(),
    production_code: z.string(),
    runtime: z.number(),
    season_number: z.number(),
    show_id: z.number(),
    still_path: z.string().optional(),
  }),
  name: z.string(),
  next_episode_to_air: z.string().optional(),
  networks: z.array(
    z.object({
      id: z.number(),
      logo_path: z.string(),
      name: z.string(),
      origin_country: z.string(),
    }),
  ),
  number_of_episodes: z.number(),
  number_of_seasons: z.number(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().optional(),
  production_companies: z.array(
    z.object({
      id: z.number(),
      logo_path: z.string().optional(),
      name: z.string(),
      origin_country: z.string(),
    }),
  ),
  production_countries: z.array(
    z.object({
      iso_3166_1: z.string(),
      name: z.string(),
    }),
  ),
  seasons: z.array(
    z.object({
      air_date: z.string(),
      episode_count: z.number(),
      id: z.number(),
      name: z.string(),
      overview: z.string(),
      poster_path: z.string().optional(),
      season_number: z.number(),
      vote_average: z.number(),
    }),
  ),
  spoken_languages: z.array(
    z.object({
      english_name: z.string(),
      iso_639_1: z.string(),
      name: z.string(),
    }),
  ),
  status: z.string(),
  tagline: z.string(),
  type: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
});

const CrewMemberSchema = z.object({
  department: z.string(),
  job: z.string(),
  credit_id: z.string(),
  adult: z.boolean(),
  gender: z.number(),
  id: z.number(),
  known_for_department: z.string(),
  name: z.string(),
  original_name: z.string(),
  popularity: z.number(),
  profile_path: z.string().optional(),
});

const GuestStarSchema = z.object({
  character: z.string(),
  credit_id: z.string(),
  order: z.number(),
  adult: z.boolean(),
  gender: z.number(),
  id: z.number(),
  known_for_department: z.string(),
  name: z.string(),
  original_name: z.string(),
  popularity: z.number(),
  profile_path: z.string().optional(),
});

export const SeasonDetailsSchema = z.object({
  _id: z.string(),
  air_date: z.string(),
  episodes: z.array(
    z.object({
      air_date: z.string(),
      episode_number: z.number(),
      id: z.number(),
      name: z.string(),
      overview: z.string(),
      production_code: z.string(),
      runtime: z.number(),
      season_number: z.number(),
      show_id: z.number(),
      still_path: z.string().optional(),
      vote_average: z.number(),
      vote_count: z.number(),
      crew: z.array(CrewMemberSchema),
      guest_stars: z.array(GuestStarSchema),
    }),
  ),
  name: z.string(),
  overview: z.string(),
  id: z.number(),
  poster_path: z.string().optional(),
  season_number: z.number(),
  vote_average: z.number(),
});

export const EpisodeDetailsSchema = z.object({
  air_date: z.string(),
  crew: z.array(CrewMemberSchema),
  episode_number: z.number(),
  guest_stars: z.array(GuestStarSchema),
  name: z.string(),
  overview: z.string(),
  id: z.number(),
  production_code: z.string(),
  runtime: z.number(),
  season_number: z.number(),
  still_path: z.string().optional(),
  vote_average: z.number(),
  vote_count: z.number(),
});

const PaginationsSchema = z.object({
  "X-Pagination-Page": z.number(),
  "X-Pagination-Page-Count": z.number(),
  "X-Pagination-Item-Count": z.number(),
});

export const TraktMovieListSchema = z.array(MovieDetailsSchema).and(PaginationsSchema);

export const TraktShowListSchema = z.array(ShowDetailsSchema).and(PaginationsSchema);
