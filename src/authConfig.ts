import type { IAuthConfig, IAuthInternalConfig, Keys } from "./types";
import { toURL, makeKey } from "./utils/others";

export let config: IAuthInternalConfig | null = null;

export const getConfig = () => config;

export function createInternalConfig(
  passedConfig: IAuthConfig
): IAuthInternalConfig {
  // Set default values for internal config object
  const {
    preLogin = () => null,
    postLogin = () => null,
    onLogInError = () => null,
    storage = "local",
    spaCallbackUri = passedConfig.spaCallbackUri
      ? toURL(passedConfig.spaCallbackUri).toString()
      : window.location.origin,
    logoutRedirect = passedConfig.logoutRedirect
      ? toURL(passedConfig.logoutRedirect).toString()
      : window.location.origin,
    storageKeyPrefix = "auth_",
    googleProvider,
  }: IAuthConfig = passedConfig;

  config = {
    ...passedConfig,
    preLogin,
    postLogin,
    onLogInError,
    storage,
    storageKeyPrefix,
    spaCallbackUri,
    logoutRedirect,
    keys: createAuthKeys(storageKeyPrefix),
    googleProvider: googleProvider
      ? { type: "spa", scope: "openid email profile", ...googleProvider }
      : undefined,
  };

  return config;
}

export function createAuthKeys(prefix?: string): Record<keyof Keys, string> {
  return {
    PROVIDER_TYPE: makeKey("provider_type", prefix),
    PROVIDER: makeKey("provider", prefix),
    VERIFIER: makeKey("verifier", prefix),
    ACCESS_TOKEN: makeKey("access_token", prefix),
    EXPIRES_IN: makeKey("expires_in", prefix),
    REFRESH_TOKEN: makeKey("refresh_token", prefix),
    TOKEN_TYPE: makeKey("token_type", prefix),
    ID_TOKEN: makeKey("id_token", prefix),
  };
}
