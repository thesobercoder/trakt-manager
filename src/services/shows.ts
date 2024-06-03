import fetch from "node-fetch";
import { TRAKT_API_URL, TRAKT_CLIENT_ID } from "../lib/constants";
import { oauthClient } from "../lib/oauth";

export const searchShows = async (query: string, page: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(
    `${TRAKT_API_URL}/search/show?query=${encodeURIComponent(query)}&page=${page}&limit=10&fields=title`,
    {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": TRAKT_CLIENT_ID,
        Authorization: `Bearer ${tokens?.accessToken}`,
      },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const result = (await response.json()) as TraktShowList;
  result.page = Number(response.headers.get("X-Pagination-Page") ?? 1);
  result.total_pages = Number(response.headers.get("X-Pagination-Page-Count") ?? 1);
  result.total_results = Number(response.headers.get("X-Pagination-Item-Count") ?? result.length);

  return result;
};

export const getWatchlistShows = async (page: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/sync/watchlist/shows/added?page=${page}&limit=10&fields=title`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const result = (await response.json()) as TraktShowList;
  result.page = Number(response.headers.get("X-Pagination-Page") ?? 1);
  result.total_pages = Number(response.headers.get("X-Pagination-Page-Count") ?? 1);
  result.total_results = Number(response.headers.get("X-Pagination-Item-Count") ?? result.length);

  return result;
};

export const getSeasons = async (traktId: number, tmdbId: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const traktResponse = await fetch(`${TRAKT_API_URL}/shows/${traktId}/seasons`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    signal,
  });

  if (!traktResponse.ok) {
    throw new Error(traktResponse.statusText);
  }

  const result = (await traktResponse.json()) as TraktSeasonList;
  // const tmdbShowCache = await LocalStorage.getItem<string>(`show_${tmdbId}`);
  // if (tmdbShowCache) {
  //   const tmdbShow = JSON.parse(tmdbShowCache) as TMDBShowDetails;
  //   for (const traktSeason of result) {
  //     const tmdbSeason = tmdbShow.seasons.find((m) => m.season_number === traktSeason.number);
  //     if (tmdbSeason) {
  //       traktSeason.poster_path = tmdbSeason.poster_path;
  //       traktSeason.name = tmdbSeason.name;
  //       traktSeason.air_date = tmdbSeason.air_date;
  //     }
  //   }
  //   return result;
  // }

  // const preferences = getPreferenceValues<ExtensionPreferences>();
  // if (preferences.apiKey) {
  //   const tmdbResponse = await fetch(`${TMDB_API_URL}/tv/${tmdbId}?api_key=${preferences.apiKey}`, {
  //     signal,
  //   });
  //   if (!tmdbResponse.ok) {
  //     throw new Error(tmdbResponse.statusText);
  //   }

  //   const tmdbShow = (await tmdbResponse.json()) as TMDBShowDetails;
  //   for (const traktSeason of result) {
  //     const tmdbSeason = tmdbShow.seasons.find((m) => m.season_number === traktSeason.number);
  //     if (tmdbSeason) {
  //       traktSeason.poster_path = tmdbSeason.poster_path;
  //       traktSeason.name = tmdbSeason.name;
  //       traktSeason.air_date = tmdbSeason.air_date;
  //     }
  //     await LocalStorage.setItem(`show_${tmdbId}`, JSON.stringify(tmdbShow));
  //   }
  // }

  return result;
};

export const getEpisodes = async (
  traktId: number,
  tmdbId: number,
  seasonNumber: number,
  signal: AbortSignal | undefined,
) => {
  const tokens = await oauthClient.getTokens();
  const traktResponse = await fetch(`${TRAKT_API_URL}/shows/${traktId}/seasons/${seasonNumber}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    signal,
  });

  if (!traktResponse.ok) {
    throw new Error(traktResponse.statusText);
  }

  const result = (await traktResponse.json()) as TraktEpisodeList;
  // const cachedSeason = await LocalStorage.getItem<string>(`season_${tmdbId}`);
  // if (cachedSeason) {
  //   const tmdbSeason = JSON.parse(cachedSeason) as TMDBSeasonDetails;
  //   if (tmdbSeason) {
  //     for (const traktEpisode of result) {
  //       const tmdbEpisode = tmdbSeason.episodes.find((m) => m.episode_number === traktEpisode.number);
  //       if (tmdbEpisode) {
  //         traktEpisode.poster_path = tmdbEpisode.still_path;
  //       }
  //     }
  //   }
  //   return result;
  // }

  // const preferences = getPreferenceValues<ExtensionPreferences>();
  // if (preferences.apiKey) {
  //   const tmdbResponse = await fetch(
  //     `${TMDB_API_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${preferences.apiKey}`,
  //     {
  //       signal,
  //     },
  //   );
  //   if (!tmdbResponse.ok) {
  //     throw new Error(tmdbResponse.statusText);
  //   }

  //   const tmdbSeason = (await tmdbResponse.json()) as TMDBSeasonDetails;
  //   for (const traktEpisode of result) {
  //     const tmdbEpisode = tmdbSeason.episodes.find((m) => m.episode_number === traktEpisode.number);
  //     if (tmdbEpisode) {
  //       traktEpisode.poster_path = tmdbEpisode.still_path;
  //     }
  //   }
  //   await LocalStorage.setItem(`season_${tmdbId}`, JSON.stringify(tmdbSeason));
  // }

  return result;
};

export const addShowToWatchlist = async (showId: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/sync/watchlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    body: JSON.stringify({
      shows: [
        {
          ids: {
            trakt: showId,
          },
        },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
};

export const checkInEpisode = async (episodeId: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    body: JSON.stringify({
      episode: {
        ids: {
          trakt: episodeId,
        },
      },
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
};
