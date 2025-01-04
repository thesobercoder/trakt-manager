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

      const compatHeaders = new Headers(Object.fromEntries(result.headers.entries()));

      return {
        headers: compatHeaders,
        ok: result.ok,
        redirected: result.redirected,
        status: result.status,
        statusText: result.statusText,
        type: result.type,
        url: result.url,
        body: result.body,
        bodyUsed: result.bodyUsed,
        size: result.size,
        text: () => result.text(),
        json: () => result.json(),
        blob: () => result.blob(),
        formData: () => result.formData(),
        arrayBuffer: () => result.arrayBuffer(),
      };
    },
  });
};
