declare type TraktMovieList = Array<{
  rank: number;
  id: number;
  listed_at: string;
  notes: string;
  type: string;
  movie: {
    title: string;
    year: number;
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
    year: number;
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
  poster_path: string;
  name: string;
  air_date: string;
  details: TMDBSeasonDetails;
  ids: {
    trakt: number;
    tvdb: number;
    tmdb: number;
  };
}>;

declare type TraktEpisodeList = Array<{
  season: number;
  number: number;
  title: string;
  poster_path: string;
  ids: {
    trakt: number;
    tvdb: number;
    imdb: string;
    tmdb: number;
  };
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
