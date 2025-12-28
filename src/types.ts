import type { ReactNode } from "react";

export interface IAuthContext {
  loginInProgress: boolean;
  signinWithGoogle: () => Promise<void>;
  logOut: ILogoutFunc;
  user?: any;
  error?: string | null;
}

export interface IAuthProvider {
  authConfig: IAuthConfig;
  children: ReactNode;
}

export type IAuthStorageType = "session" | "local";

export type IAuthGoogleProviderType = "spa";

export interface IAuthGoogleProvider {
  clientId: string;
  type?: IAuthGoogleProviderType;
  scope?: string;
}

// Input from users of the package, some optional values
export type IAuthConfig = {
  googleProvider?: IAuthGoogleProvider;
  spaCallbackUri?: string;
  logoutRedirect?: string;
  preLogin?: () => void;
  postLogin?: () => void;
  onLogInError?: (err: any) => void;
  storageKeyPrefix?: string;
  storage?: IAuthStorageType;

  error?: string | null;
};

export type Keys = {
  PROVIDER_TYPE: string;
  PROVIDER: string;
  VERIFIER: string;
  ACCESS_TOKEN: string;
  EXPIRES_IN: string;
  REFRESH_TOKEN: string;
  TOKEN_TYPE: string;
  ID_TOKEN: string;
};

export type IAuthInternalConfig = IAuthConfig & { keys: Keys };

export type ILogoutFunc = (args?: {
  logoutHint?: string;
  redirect?: boolean;
  redirectUri?: string;
}) => void;
