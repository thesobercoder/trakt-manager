import { initClient } from "@ts-rest/core";
import fetch from "node-fetch";
import { TRAKT_API_URL, TRAKT_CLIENT_ID } from "./constants";
import { TraktContract } from "./contract";
import { oauthProvider } from "./oauth";

export const initTraktClient = (controller: AbortController | undefined) => {
  return initClient(TraktContract, {
    baseUrl: TRAKT_API_URL,
    baseHeaders: {
      "Content-Type": "application/json; charset=utf-8",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
    },
    api: async ({ path, method, body, headers }) => {
      const accessToken = await oauthProvider.authorize();

      const response = await fetch(path, {
        method,
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
        },
        body,
        signal: controller?.signal,
      });

      const res = {
        status: response.status,
        body: await response.json(),
        headers: Object.fromEntries(response.headers.entries()) as unknown as Headers,
      };

      return res;
    },
  });
};
