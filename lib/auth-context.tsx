'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from './auth-api';
import type { User } from './types';

const TOKEN_KEY = 'kavuri_token';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  initialising: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (user: User, token: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setInitialising(false);
      return;
    }

    authApi
      .me(stored)
      .then((fetchedUser) => {
        setToken(stored);
        setUser(fetchedUser);
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setInitialising(false));
  }, []);

  const setSession = useCallback((nextUser: User, nextToken: string) => {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const signIn = useCallback(
    async (identifier: string, password: string) => {
      const result = await authApi.login(identifier, password);
      setSession(result.user, result.token);
    },
    [setSession]
  );

  const signOut = useCallback(async () => {
    if (token) {
      await authApi.logout(token).catch(() => undefined);
    }
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, initialising, signIn, signOut, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
