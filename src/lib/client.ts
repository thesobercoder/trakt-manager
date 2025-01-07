import { getPreferenceValues } from "@raycast/api";
import { initClient } from "@ts-rest/core";
import fetch from "node-fetch";
import { TRAKT_API_URL } from "./constants";
import { TraktContract } from "./contract";

export const initTraktClient = () => {
  return initClient(TraktContract, {
    baseUrl: TRAKT_API_URL,
    baseHeaders: {
      "Content-Type": "application/json; charset=utf-8",
      "trakt-api-version": "2",
    },
    api: async ({ path, method, body, headers, fetchOptions }) => {
      // Turn this on when the new Trakt API goes live and accepts the new OAuth flow
      // const accessToken = await AuthProvider.authorize();

      const preferences = getPreferenceValues<ExtensionPreferences>();
      const accessToken = preferences.token;
      const traktClientId = preferences.clientId;

      const response = await fetch(path, {
        method,
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
          "trakt-api-key": traktClientId,
        },
        body,
        ...fetchOptions,
      });

      console.log(
        "[API Request]",
        JSON.stringify(
          {
            method,
            path,
            accessToken,
            body,
            headers,
            status: response.status,
            statusText: response.statusText,
          },
          null,
          2,
        ),
      );

      const compatResponse = {
        status: response.status,
        body: await response.json(),
        headers: Object.fromEntries(response.headers.entries()) as unknown as Headers,
      };

      return compatResponse;
    },
  });
};
