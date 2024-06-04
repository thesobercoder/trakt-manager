declare type TraktMovieList = Array<{
  rank: number;
  id: number;
  listed_at: string;
  notes: string;
  type: string;
  movie: {
    title: string;
    year?: number;
    details?: TMDBMovieDetails;
    ids: {
      trakt: number;
      slug: string;
      imdb: string;
      tmdb: number;
    };
  };
}> & {
  page: number;
  total_pages: number;
  total_results: number;
};

declare type TraktShowList = Array<{
  rank: number;
  id: number;
  listed_at: string;
  notes: string;
  type: string;
  score: number;
  show: {
    title: string;
    year?: number;
    details?: TMDBShowDetails;
    ids: {
      trakt: number;
      slug: string;
      tvdb: number;
      imdb: string;
      tmdb: number;
    };
  };
}> & {
  page: number;
  total_pages: number;
  total_results: number;
};

declare type TraktSeasonList = Array<{
  number: number;
  ids: {
    trakt: number;
    tvdb: number;
    tmdb: number;
  };
  rating: number;
  votes: number;
  episode_count: number;
  aired_episodes: number;
  title: string;
  overview?: string;
  first_aired: string;
  udpated_at: string;
  network: string;
  details?: TMDBSeasonDetails;
}>;

declare type TraktEpisodeList = Array<{
  season: number;
  number: number;
  title: string;
  ids: {
    trakt: number;
    tvdb: number;
    imdb: string;
    tmdb: number;
    tvrage: any;
  };
  number_abs?: number;
  overview?: string;
  rating: number;
  votes: number;
  comment_count: number;
  first_aired: string;
  updated_at: string;
  available_translations: Array<string>;
  runtime: number;
  episode_type: string;
  details?: TMDBEpisodeDetails;
}>;

declare type TraktOnDeckList = Array<{
  plays: number;
  last_watched_at: string;
  last_updated_at: string;
  reset_at: any;
  show: {
    title: string;
    year: number;
    details?: TMDBShowDetails;
    progress?: TraktShowProgress;
    ids: {
      trakt: number;
      slug: string;
      tvdb: number;
      imdb: string;
      tmdb: number;
      tvrage: any;
    };
  };
}>;

declare type TraktShowProgress = {
  aired: number;
  completed: number;
  last_watched_at: string;
  reset_at: {};
  seasons: Array<{
    number: number;
    title: string;
    aired: number;
    completed: number;
    episodes: Array<{
      number: number;
      completed: boolean;
      last_watched_at: any;
    }>;
  }>;
  hidden_seasons: Array<{
    number: number;
    ids: {
      trakt: number;
      tvdb: number;
      tmdb: number;
    };
  }>;
  next_episode?: {
    season: number;
    number: number;
    title: string;
    ids: {
      trakt: number;
      tvdb: number;
      imdb: number;
      tmdb: number;
    };
  };
  last_episode?: {
    season: number;
    number: number;
    title: string;
    ids: {
      trakt: number;
      tvdb: number;
      imdb: number;
      tmdb: number;
    };
  };
};
