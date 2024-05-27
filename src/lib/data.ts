import { API_URL, CLIENT_ID } from "./constants";
import { oauthClient } from "./oauth";
import fetch from "node-fetch";

export async function searchMovies(query: string) {
  const tokens = await oauthClient.getTokens();

  const response = await fetch(`${API_URL}/search/movie?query=${query}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": CLIENT_ID,
      "Authorization": `Bearer ${tokens?.accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Search movies:", await response.text());
    throw new Error(response.statusText);
  }

  return await response.json();
}
