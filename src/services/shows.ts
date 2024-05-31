import { LocalStorage, getPreferenceValues } from "@raycast/api";
import fetch, { type Response } from "node-fetch";
import { TMDB_API_URL, TRAKT_API_URL, TRAKT_CLIENT_ID } from "../lib/constants";
import { oauthClient } from "../lib/oauth";
import { TMDBShowDetails, TraktEpisodeList, TraktSeasonList, TraktShowList } from "../lib/types";

const getCache = async (cacheId: string) => {
  const tmdbShowCache = await LocalStorage.getItem<string>(cacheId);
  if (tmdbShowCache) {
    return JSON.parse(tmdbShowCache) as TMDBShowDetails;
  }
};

export const searchShows = async (query: string, page: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/search/show?query=${encodeURIComponent(query)}&page=${page}&limit=5`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    signal,
  });

  const result = (await response.json()) as TraktShowList;
  result.page = Number(response.headers.get("X-Pagination-Page") ?? 1);
  result.total_pages = Number(response.headers.get("X-Pagination-Page-Count") ?? 1);
  result.total_results = Number(response.headers.get("X-Pagination-Item-Count") ?? result.length);

  const cachedShowNotFound = new Array<number>();
  for (const show of result) {
    const tmdbShow = await getCache(`show_${show.show.ids.tmdb}`);
    if (tmdbShow) {
      show.show.poster_path = tmdbShow.poster_path;
      continue;
    }
    cachedShowNotFound.push(show.show.ids.tmdb);
  }

  const preferences = getPreferenceValues<ExtensionPreferences>();
  if (preferences.apiKey) {
    const showPromises = new Array<Promise<Response>>();

    for (const show of cachedShowNotFound) {
      showPromises.push(
        fetch(`${TMDB_API_URL}/tv/${show}?api_key=${preferences.apiKey}`, {
          signal,
        }),
      );
    }

    if (showPromises && showPromises.length > 0) {
      const allTMDBShows = await Promise.all(showPromises);
      for (const show of allTMDBShows) {
        const tmdbShow = (await show.json()) as TMDBShowDetails;
        await LocalStorage.setItem(`show_${tmdbShow.id}`, JSON.stringify(tmdbShow));
        const traktShow = result.find((m) => m.show.ids.tmdb === tmdbShow.id);
        if (traktShow) {
          traktShow.show.poster_path = tmdbShow.poster_path;
        }
      }
    }
  }

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

  const result = (await traktResponse.json()) as TraktSeasonList;
  const tmdbShowCache = await getCache(`show_${tmdbId}`);
  if (tmdbShowCache) {
    for (const traktSeason of result) {
      const tmdbSeason = tmdbShowCache.seasons.find((m) => m.season_number === traktSeason.number);
      if (tmdbSeason) {
        traktSeason.poster_path = tmdbSeason.poster_path;
        traktSeason.name = tmdbSeason.name;
        traktSeason.air_date = tmdbSeason.air_date;
      }
    }
    return result;
  }

  const preferences = getPreferenceValues<ExtensionPreferences>();
  if (preferences.apiKey) {
    const tmdbResponse = await fetch(`${TMDB_API_URL}/tv/${tmdbId}?api_key=${preferences.apiKey}`, {
      signal,
    });
    if (!tmdbResponse.ok) {
      throw new Error(tmdbResponse.statusText);
    }

    const tmdbShow = (await tmdbResponse.json()) as TMDBShowDetails;
    for (const traktSeason of result) {
      const tmdbSeason = tmdbShow.seasons.find((m) => m.season_number === traktSeason.number);
      if (tmdbSeason) {
        traktSeason.poster_path = tmdbSeason.poster_path;
        traktSeason.name = tmdbSeason.name;
        traktSeason.air_date = tmdbSeason.air_date;
      }
      await LocalStorage.setItem(`show_${tmdbId}`, JSON.stringify(tmdbShow));
    }
  }

  return result;
};

export const getSeasonEpisodes = async (showId: number, seasonNumber: number, signal: AbortSignal | undefined) => {
  const preferences = getPreferenceValues<ExtensionPreferences>();
  const response = await fetch(`${TMDB_API_URL}/tv/${showId}/season/${seasonNumber}?api_key=${preferences.apiKey}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return (await response.json()) as TraktEpisodeList;
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
