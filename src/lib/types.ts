export type Movie = {
  type: string;
  score: number;
  movie: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      imdb: string;
      tmdb: number;
    };
  };
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
