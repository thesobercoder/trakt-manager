import { OAuth } from "@raycast/api";
import { API_URL, OAUTH_URL } from "./constants";
import fetch from "node-fetch";

const clientId =
  "f7525a53be3842c4ff7570cfd33ca792c7f9717ab8f74af34337d6595f40af46";

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Trakt",
  // providerIcon: "twitter-logo.png",
  description: "Connect your Trakt account…",
});

export const authorize = async () => {
  const authRequest = await client.authorizationRequest({
    endpoint: `${OAUTH_URL}/oauth/authorize`,
    clientId: clientId,
    scope: "",
  });

  const { authorizationCode } = await client.authorize(authRequest);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("code", authorizationCode);
  params.append("code_verifier", authRequest.codeVerifier);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", authRequest.redirectURI);

  const response = await fetch(`${OAUTH_URL}/oauth/token`, {
    method: "POST",
    body: params,
  });
  if (!response.ok) {
    console.error("Fetch tokens error:", await response.text());
    throw new Error(response.statusText);
  }

  const tokenResponse = (await response.json()) as OAuth.TokenResponse;
  await client.setTokens(tokenResponse);
};

export async function fetchToken(
  authRequest: OAuth.AuthorizationRequest,
  authCode: string,
) {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("code", authCode);
  params.append("verifier", authRequest.codeVerifier);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", authRequest.redirectURI);

  const response = await fetch(`${OAUTH_URL}/oauth/token`, {
    method: "POST",
    body: params,
  });
  if (!response.ok) {
    console.error("fetch tokens error:", await response.text());
    throw new Error(response.statusText);
  }

  const tokenResponse = (await response.json()) as OAuth.TokenResponse;
  await client.setTokens(tokenResponse);
}

export async function refreshToken(refreshToken: string) {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const response = await fetch(`${OAUTH_URL}/oauth/token`, {
    method: "POST",
    body: params,
  });
  if (!response.ok) {
    console.error("refresh tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  const tokenResponse = (await response.json()) as OAuth.TokenResponse;
  tokenResponse.refresh_token = tokenResponse.refresh_token ?? refreshToken;
  await client.setTokens(tokenResponse);
}

export async function searchMovies(query: string) {
  const tokens = await client.getTokens();

  const response = await fetch(`${API_URL}/search/movie?query=${query}`, {
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": clientId,
      "Authorization": `Bearer ${tokens?.accessToken}`,
    },
  });

  return await response.json();
}
