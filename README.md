# React OAuth Providers

A lightweight React package for OAuth authentication. Currently, only **Google** is supported.

## ⚠️ **Notes**

- This package is designed for **SPA applications**.
- Google **UWP clients** are supported.
- Passing a **client secret** from the frontend is **vulnerable** and should be avoided.
- Configure **spaCallbackUri** correctly to match your route.

---

<br>
<br>

## 📦 Installation

```bash
npm install react-oauth-providers@latest
```

<br>
<br>

## ⚙️ Setup Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new app.

Create an OAuth client and set **Application type** as **Universal Windows Platform (UWP)**.

<br>
<br>

## 🚀 Quick Start

```js
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider, type IAuthConfig } from 'react-oauth-providers'
import App from './App'

const authConfig: IAuthConfig = {
  googleProvider: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  storage: 'session', // 'session' | 'local'
  spaCallbackUri: `${window.location.origin}/auth/callback`,
  preLogin: () => console.log('Before login...'),
  postLogin: async () => {
    console.log('After login...')
    window.location.href = window.location.origin
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider authConfig={authConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
)
```

<br>
<br>

## 🔑 Using Authentication in Components

```js
import { useAuth } from "@/providers/Auth";

export default function Login() {
  const { loginInProgress, user, logOut, signinWithGoogle } = useAuth();

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.name}</p>
          <button onClick={logOut}>Logout</button>
        </>
      ) : (
        <button
          onClick={async () => await signinWithGoogle()}
          disabled={loginInProgress}
        >
          {loginInProgress ? "Signing in..." : "Sign in with Google"}
        </button>
      )}
    </div>
  );
}
```

<br>
<br>

## ✅ Features

- **Google OAuth** (no backend secret required)
- **Session or Local storage** support
- **preLogin** & **postLogin** hooks for custom logic
- **Automatic token management**: token storage, decoding, and refresh are fully handled by the package
- Fully **React hooks-based** API (useAuth)

<br>

## 🧩 AuthProvider Props

| Prop           | Type                                   | Description                                               |
| -------------- | -------------------------------------- | --------------------------------------------------------- |
| googleProvider | `{ clientId: string, scope?: string }` | Your Google OAuth client configuration                    |
| storage        | `"session" \| "local"`                 | Storage type for session or local storage                 |
| spaCallbackUri | `string`                               | SPA callback URL for OAuth redirects                      |
| preLogin       | `() => void`                           | Function called before login starts                       |
| postLogin      | `() => void \| Promise<void>`          | Function called after login completes                     |
| onLogInError   | `(error) => void`                      | Function called when an error occurs in the login process |
