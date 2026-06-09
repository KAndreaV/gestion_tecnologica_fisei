"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
} from "@/lib/constants";
import { getCookie, removeCookie, setCookie } from "@/lib/utils";
import type { AuthSession, AuthUser } from "@/features/auth/auth.types";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? getCookie(AUTH_COOKIE_NAME);
    const storedUser = readStoredUser();

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login: (session) => {
        setToken(session.token);
        setUser(session.user ?? null);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, session.token);
          if (session.user) {
            window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(session.user));
          } else {
            window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
          }
        }

        setCookie(AUTH_COOKIE_NAME, session.token);
      },
      logout: () => {
        setToken(null);
        setUser(null);

        if (typeof window !== "undefined") {
          window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        }

        removeCookie(AUTH_COOKIE_NAME);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }

  return context;
}