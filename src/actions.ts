import { getSessionItem } from "./utils/session";
import {
  getGoogleSessionUser,
  signinWithGoogleCallback,
  refreshGoogleAccessToken,
} from "./google";
import { getConfig } from "./authConfig";
import { AUTH_PROVIDERS } from "./utils/constants";
import { getFromStorage, removeFromStorage } from "./utils/storage";

export { signinWithGoogleSpa as signinWithGoogleSpa } from "./google";

let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

export const handleCallback = async () => {
  const config = getConfig();
  if (!config) return;

  const keys = config?.keys;

  const authMode = getSessionItem(keys.PROVIDER);
  const verifier = getSessionItem(keys.VERIFIER);
  if (!authMode || !verifier) return;

  try {
    switch (authMode) {
      case AUTH_PROVIDERS.google: {
        const searchQuery = new URLSearchParams(window.location.search);
        const code = searchQuery.get("code");
        if (!code) return;

        await signinWithGoogleCallback(code, verifier);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    return Promise.reject(error);
  }
};

export const handleFetchSessionUser = async (retry = true) => {
  const config = getConfig();
  if (!config) return;

  const keys = config?.keys;

  const authMode = getFromStorage(config.storage!, keys.PROVIDER);
  if (!authMode) return;

  let sessionUser = null;

  try {
    switch (authMode) {
      case AUTH_PROVIDERS.google: {
        sessionUser = await getGoogleSessionUser();
        break;
      }

      default:
        break;
    }

    if (sessionUser) handleScheduleTokenRefresh();

    return sessionUser;
  } catch (error) {
    console.log("Fetch Session User Error:", error);

    if (!retry) return null;

    switch (authMode) {
      case AUTH_PROVIDERS.google: {
        await refreshGoogleAccessToken();
        await handleFetchSessionUser(false);

        break;
      }

      default:
        break;
    }

    return null;
  }
};

const handleScheduleTokenRefresh = () => {
  const config = getConfig();
  if (!config) return;

  const keys = config?.keys;

  const authMode = getFromStorage(config.storage!, keys.PROVIDER);
  if (!authMode) return;

  const expiresIn = Number(
    getFromStorage(config.storage!, keys.EXPIRES_IN) ?? 0
  );
  if (!expiresIn) return;

  clearTokenRefresh();

  // Refresh 60 seconds before expiry
  const refreshTime = expiresIn - 60 * 1000;
  refreshTimeout = setTimeout(async () => {
    switch (authMode) {
      case AUTH_PROVIDERS.google: {
        await refreshGoogleAccessToken();
        break;
      }

      default:
        break;
    }
  }, refreshTime);
};

const clearTokenRefresh = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
};

export const logout = () => {
  clearTokens();
  clearTokenRefresh();
};

const clearTokens = () => {
  const config = getConfig();
  if (!config) return;

  const keys = config?.keys;

  const {
    PROVIDER,
    ACCESS_TOKEN,
    EXPIRES_IN,
    REFRESH_TOKEN,
    TOKEN_TYPE,
    ID_TOKEN,
    PROVIDER_TYPE,
  } = keys;

  removeFromStorage(config.storage!, PROVIDER);
  removeFromStorage(config.storage!, PROVIDER_TYPE);
  removeFromStorage(config.storage!, ACCESS_TOKEN);
  removeFromStorage(config.storage!, EXPIRES_IN);
  removeFromStorage(config.storage!, REFRESH_TOKEN);
  removeFromStorage(config.storage!, TOKEN_TYPE);
  removeFromStorage(config.storage!, ID_TOKEN);
};
