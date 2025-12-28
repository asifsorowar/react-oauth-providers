import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import * as actions from "./actions";
import type { IAuthProvider, ILogoutFunc, IAuthInternalConfig } from "./types";
import { createInternalConfig } from "./authConfig";
import { getSessionItem } from "./utils/session";

export const AuthProvider: React.FC<IAuthProvider> = ({
  authConfig,
  children,
}) => {
  const config = useMemo<IAuthInternalConfig>(
    () => createInternalConfig(authConfig),
    [authConfig]
  );
  const tmpAuthProviderType = useMemo(
    () => getSessionItem(config.keys.PROVIDER_TYPE),
    [config]
  );

  const [loginInProgress, setLoginInProgress] = useState(true);
  const [user, setUser] = useState<null | any>();

  useEffect(() => {
    actions.handleFetchSessionUser().then((user) => {
      setUser(user);
      setLoginInProgress(false);
    });
  }, []);

  const signinWithGoogle = useCallback(async () => {
    if (!config.googleProvider?.clientId) {
      throw Error(
        "'clientId' must be set in the 'googleProvider' object in the AuthProvider Config"
      );
    }

    config.preLogin?.();

    try {
      if (config.googleProvider.type === "spa") {
        await actions.signinWithGoogleSpa();
      }
    } catch (error) {
      config.onLogInError?.(error);
    }
  }, []);

  // callback handler for spa login
  useEffect(() => {
    if (!config || !tmpAuthProviderType) return;
    if (window.location.pathname !== new URL(config.spaCallbackUri!).pathname) {
      return;
    }

    const callback = async () => {
      try {
        await actions.handleCallback();

        config.postLogin?.();
      } catch (error) {
        config.onLogInError?.(error);
      }
    };

    callback();
  }, [tmpAuthProviderType, config]);

  const logOut = useCallback<ILogoutFunc>(
    ({ logoutHint, redirect = true, redirectUri } = {}) => {
      actions.logout();

      if (!redirect) return;

      // Determine redirect URL or fallback to root
      const baseUrl = redirectUri || config.logoutRedirect || "/";

      const params = new URLSearchParams();
      if (logoutHint) params.append("logout_hint", logoutHint);

      // Append params only if there are any
      const url = params.toString()
        ? `${baseUrl}?${params.toString()}`
        : baseUrl;

      window.location.assign(url);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        loginInProgress,
        signinWithGoogle,
        user,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
