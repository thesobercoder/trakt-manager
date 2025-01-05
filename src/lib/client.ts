import { initClient } from "@ts-rest/core";
import fetch from "node-fetch";
import { TRAKT_API_URL, TRAKT_CLIENT_ID } from "./constants";
import { TraktContract } from "./contract";
import { oauthProvider } from "./oauth";

export const initTraktClient = () => {
  return initClient(TraktContract, {
    baseUrl: TRAKT_API_URL,
    baseHeaders: {
      "Content-Type": "application/json; charset=utf-8",
      "trakt-api-version": "2",
      "trakt-api-key": TRAKT_CLIENT_ID,
    },
    api: async ({ path, method, body, headers, fetchOptions }) => {
      const accessToken = await oauthProvider.authorize();

      console.log(
        "[API Request]",
        JSON.stringify(
          {
            method,
            path,
            accessToken,
            body,
            headers,
          },
          null,
          2,
        ),
      );

      const response = await fetch(path, {
        method,
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
        },
        body,
        ...fetchOptions,
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
