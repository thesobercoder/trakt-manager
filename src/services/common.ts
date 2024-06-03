import { environment } from "@raycast/api";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { TRAKT_API_URL, TRAKT_CLIENT_ID } from "../lib/constants";
import { oauthClient } from "../lib/oauth";

export const getOnDeckItems = async (signal: AbortSignal | undefined) => {
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

  console.log("Status:", response.statusText);
  const res = await response.json();
  console.log("Tokens:", tokens);
  writeFile(environment.supportPath + "/test.json", JSON.stringify(res, null, 2), "utf8");

  // TODO call https://api.trakt.tv/shows/{slug}/progress/watched?hidden=false&specials=false
  // to get the progress of each show

  // const result = (await response.json()) as TraktOnDeckList;

  return [];
};
