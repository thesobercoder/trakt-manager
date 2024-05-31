import { LocalStorage, getPreferenceValues } from "@raycast/api";
import fetch, { type Response } from "node-fetch";
import { TMDB_API_URL, TRAKT_API_URL, TRAKT_CLIENT_ID } from "../lib/constants";
import { oauthClient } from "../lib/oauth";
import { EpisodeDetails, TMDBShowDetails, TraktSeasonList, TraktShowList } from "../lib/types";

export const searchShows = async (query: string, page: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(
    `${TRAKT_API_URL}/search/show?query=${encodeURIComponent(query)}&page=${page}&limit=10`,
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

  const result = (await response.json()) as TraktShowList;
  result.page = Number(response.headers.get("X-Pagination-Page") ?? 1);
  result.total_pages = Number(response.headers.get("X-Pagination-Page-Count") ?? 1);
  result.total_results = Number(response.headers.get("X-Pagination-Item-Count") ?? result.length);

  const preferences = getPreferenceValues<ExtensionPreferences>();
  if (preferences.apiKey) {
    const posterPromises = new Array<Promise<Response>>();
    for (const show of result) {
      const poster = await LocalStorage.getItem<string>(`${show.show.ids.tmdb}`);
      if (poster) {
        show.show.poster_path = poster;
        continue;
      }
      posterPromises.push(
        fetch(`${TMDB_API_URL}/tv/${show.show.ids.tmdb}?api_key=${preferences.apiKey}`, {
          signal,
        }),
      );
    }

    if (posterPromises && posterPromises.length > 0) {
      const posters = await Promise.all(posterPromises);
      for (const show of posters) {
        const poster = (await show.json()) as TMDBShowDetails;
        const traktShow = result.find((m) => m.show.ids.tmdb === poster.id);
        if (traktShow) {
          traktShow.show.poster_path = poster.poster_path;
          await LocalStorage.setItem(`${traktShow.show.ids.tmdb}`, poster.poster_path);
        }
      }
    }
  } else {
    for (const show of result) {
      const poster = await LocalStorage.getItem<string>(`${show.show.ids.tmdb}`);
      if (poster) {
        show.show.poster_path = poster;
      }
    }
  }

  return result;
};

export const getSeasons = async (traktId: number, tmdbId: number, page: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const traktResponse = await fetch(`${TRAKT_API_URL}/shows/${traktId}/seasons?page=${page}&limit=10`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    signal,
  });

  const result = (await traktResponse.json()) as TraktSeasonList;
  const preferences = getPreferenceValues<ExtensionPreferences>();
  if (preferences.apiKey) {
    const tmdbShowCache = await LocalStorage.getItem<string>(`show_${tmdbId}`);
    if (tmdbShowCache) {
      const tmdbShow = JSON.parse(tmdbShowCache) as TMDBShowDetails;
      for (const traktSeason of result) {
        const tmdbSeason = tmdbShow.seasons.find((m) => m.season_number === traktSeason.number);
        if (tmdbSeason) {
          traktSeason.poster_path = tmdbSeason.poster_path;
          traktSeason.name = tmdbSeason.name;
          traktSeason.air_date = tmdbSeason.air_date;
        }
      }
      return result;
    }

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

  return (await response.json()) as EpisodeDetails;
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
