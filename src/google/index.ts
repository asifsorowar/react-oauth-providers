import http from "../utils/http";
import { removeSessionItem, setSessionItem } from "../utils/session";
import { generatePkce } from "../utils/pkce";
import type { IAuthGoogleProviderType } from "../types";
import { getConfig } from "../authConfig";
import { AUTH_PROVIDERS } from "../utils/constants";
import { getFromStorage, keepToStorage } from "../utils/storage";

export const signinWithGoogleSpa = async () => {
  const config = getConfig();
  if (!config) return;

  const { googleProvider, keys } = config;

  const { verifier, challenge, algorithm } = await generatePkce();

  setSessionItem(keys.VERIFIER, verifier, 3 * 60 * 1000);
  setSessionItem(keys.PROVIDER, AUTH_PROVIDERS.google, 3 * 60 * 1000);
  setSessionItem(keys.PROVIDER_TYPE, googleProvider?.type!, 3 * 60 * 1000);

  const params = new URLSearchParams({
    client_id: googleProvider?.clientId!,
    redirect_uri: config?.spaCallbackUri!,
    response_type: "code",
    scope: googleProvider?.scope || "",
    code_challenge: challenge,
    code_challenge_method: algorithm,
    access_type: "offline",
    prompt: "consent",
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const signinWithGoogleCallback = async (
  code: string,
  verifier: string
) => {
  if (!code || !verifier) return;

  const config = getConfig();
  if (!config) return;

  const { googleProvider, keys } = config;
  const type: IAuthGoogleProviderType = "spa";

  try {
    const data = new URLSearchParams({
      client_id: googleProvider?.clientId!,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: config?.spaCallbackUri!,
      code_verifier: verifier,
    });

    const res = await http.post(
      "https://oauth2.googleapis.com/token",
      data.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const tokens = res.data as any;

    if (tokens?.access_token) {
      removeSessionItem(keys.PROVIDER);
      removeSessionItem(keys.VERIFIER);
      removeSessionItem(keys.PROVIDER_TYPE);

      keepToStorage(config.storage!, keys.PROVIDER, AUTH_PROVIDERS.google);
      keepToStorage(config.storage!, keys.PROVIDER_TYPE, type);
      keepToStorage(config.storage!, keys.ACCESS_TOKEN, tokens.access_token);
      keepToStorage(
        config.storage!,
        keys.EXPIRES_IN,
        String(Date.now() + tokens.expires_in * 1000)
      );
      keepToStorage(config.storage!, keys.REFRESH_TOKEN, tokens.refresh_token);
      keepToStorage(config.storage!, keys.TOKEN_TYPE, tokens.token_type);
      keepToStorage(config.storage!, keys.ID_TOKEN, tokens.id_token);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getGoogleSessionUser = async () => {
  const config = getConfig();
  if (!config) return;

  const { keys } = config;

  try {
    const accessToken = getFromStorage(config.storage!, keys.ACCESS_TOKEN);
    if (!accessToken) return;

    const res = await http.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`
    );

    const user = res.data;

    return user;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const refreshGoogleAccessToken = async () => {
  const config = getConfig();
  if (!config) return;

  const { googleProvider, keys } = config;

  const refreshToken = getFromStorage(config.storage!, keys.REFRESH_TOKEN);

  if (!refreshToken) return;

  try {
    const data = new URLSearchParams({
      client_id: googleProvider?.clientId!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const res = await http.post(
      "https://oauth2.googleapis.com/token",
      data.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const tokens = res.data as any;

    if (!tokens.access_token) {
      console.error("Failed to refresh access token", tokens);
      return null;
    }

    keepToStorage(config.storage!, keys.ACCESS_TOKEN, tokens.access_token);
    if (tokens.expires_in) {
      keepToStorage(
        config.storage!,
        keys.EXPIRES_IN,
        String(Date.now() + tokens.expires_in * 1000)
      );
    }
    if (tokens.id_token)
      keepToStorage(config.storage!, keys.ID_TOKEN, tokens.id_token);
    if (tokens.token_type)
      keepToStorage(config.storage!, keys.TOKEN_TYPE, tokens.token_type);
  } catch (error) {
    return Promise.reject(error);
  }
};
