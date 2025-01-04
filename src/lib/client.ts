import { initClient } from "@ts-rest/core";
import fetch from "node-fetch";
import { TRAKT_API_URL, TRAKT_CLIENT_ID } from "./constants";
import { TraktContract } from "./contract";
import { oauthProvider } from "./oauth";

export const initializeTraktClient = async () => {
  const accessToken = await oauthProvider.authorize();

  return initClient(TraktContract, {
    baseUrl: TRAKT_API_URL,
    baseHeaders: {
      "Content-Type": "application/json; charset=utf-8",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
    api: async ({ path, method, body, headers }) => {
      const result = await fetch(path, {
        method,
        headers,
        body,
      });

      const contentType = result.headers.get("content-type");
      const compatHeaders = new Headers(Object.fromEntries(result.headers.entries()));

      if (contentType?.includes("application/") && contentType?.includes("json")) {
        return {
          status: result.status,
          body: await result.json(),
          headers: compatHeaders,
        };
      }

      if (contentType?.includes("text/")) {
        return {
          status: result.status,
          body: await result.text(),
          headers: compatHeaders,
        };
      }

      return {
        status: result.status,
        body: await result.blob(),
        headers: compatHeaders,
      };
    },
  });
};
