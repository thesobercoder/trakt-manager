export type Movie = {
  page: number;
  results: {
    poster_path: string;
    adult: boolean;
    overview: string;
    release_date: string;
    genre_ids: number[];
    id: number;
    original_title: string;
    original_language: string;
    title: string;
    backdrop_path: string;
    popularity: number;
    vote_count: number;
    video: boolean;
    vote_average: number;
  }[];
  total_pages: number;
  total_results: number;
};

export type Show = {
  type: string;
  score: number;
  show: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      tvdb: number;
      imdb: string;
      tmdb: number;
    };
  };
};

export type Season = {
  number: number;
  ids: {
    trakt: number;
    tvdb: number;
    tmdb: number;
  };
};
