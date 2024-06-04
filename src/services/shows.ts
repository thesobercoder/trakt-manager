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

export const getSeasons = async (traktId: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const traktResponse = await fetch(`${TRAKT_API_URL}/shows/${traktId}/seasons?extended=full`, {
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

  return (await traktResponse.json()) as TraktSeasonList;
};

export const getEpisodes = async (traktId: number, seasonNumber: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const traktResponse = await fetch(`${TRAKT_API_URL}/shows/${traktId}/seasons/${seasonNumber}?extended=full`, {
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

  return (await traktResponse.json()) as TraktEpisodeList;
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

export const removeShowFromWatchlist = async (showId: number, signal: AbortSignal | undefined) => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/sync/watchlist/remove`, {
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

export const getOnDeckItems = async (signal: AbortSignal | undefined): Promise<TraktOnDeckList> => {
  const tokens = await oauthClient.getTokens();
  const response = await fetch(`${TRAKT_API_URL}/sync/watched/shows?extended=noseasons`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${tokens?.accessToken}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const result = (await response.json()) as TraktOnDeckList;
  const showPromises = result.map((show) =>
    fetch(
      `${TRAKT_API_URL}/shows/${show.show.ids.trakt}/progress/watched?hidden=false&specials=false&count_specials=false`,
      {
        headers: {
          "Content-Type": "application/json",
          "trakt-api-version": "2",
          "trakt-api-key": TRAKT_CLIENT_ID,
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        signal,
      },
    ).then((res) => ({ res, traktId: show.show.ids.trakt })),
  );

  const showResponses = await Promise.all(showPromises);
  for (const { res, traktId } of showResponses) {
    if (!res.ok) {
      throw new Error(res.statusText);
    }

    const showProgress = (await res.json()) as TraktShowProgress;
    if (showProgress.aired !== showProgress.completed) {
      const show = result.find((s) => s.show.ids.trakt === traktId);
      if (show) {
        show.show.progress = showProgress;
      }
    }
  }

  return result.filter((show) => show.show.progress);
};
