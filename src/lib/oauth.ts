import { OAuth } from "@raycast/api";
import { CLIENT_ID, OAUTH_URL } from "./constants";
import fetch from "node-fetch";

export const oauthClient = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "Trakt",
  providerIcon: "trakt.png",
  description: "Connect your Trakt account…",
  providerId: "trakt",
});

export const isAuthorized = async () => {
  const existingTokens = await oauthClient.getTokens();
  if (existingTokens && !existingTokens?.isExpired()) {
    return true;
  }
  return false;
};

export const authorize = async () => {
  const existingTokens = await oauthClient.getTokens();
  if (existingTokens?.accessToken) {
    if (existingTokens?.refreshToken && existingTokens.isExpired()) {
      await refreshTokens(existingTokens.refreshToken);
      return;
    }
    return;
  }

  const authRequest = await oauthClient.authorizationRequest({
    endpoint: `${OAUTH_URL}/oauth/authorize`,
    clientId: CLIENT_ID,
    scope: "",
  });

  const { authorizationCode } = await oauthClient.authorize(authRequest);

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
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

  const tokens = (await response.json()) as OAuth.TokenResponse;
  await oauthClient.setTokens(tokens);
};

export const fetchTokens = async (
  authRequest: OAuth.AuthorizationRequest,
  authCode: string,
) => {
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
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

  const tokens = (await response.json()) as OAuth.TokenResponse;
  await oauthClient.setTokens(tokens);
};

export const refreshTokens = async (refreshToken: string) => {
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
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
  const tokens = (await response.json()) as OAuth.TokenResponse;
  tokens.refresh_token = tokens.refresh_token ?? refreshToken;
  await oauthClient.setTokens(tokens);
};
