import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import * as authApi from '../api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import type { User } from '../api/types';

const TOKEN_KEY = 'kavuri.auth.token';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  /** True while restoring a saved session on cold start. */
  initialising: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signInWithToken: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialising, setInitialising] = useState(true);

  const signOut = useCallback(async () => {
    // Best-effort server-side revoke; the local session goes regardless so a
    // network failure can never trap someone in a signed-in state.
    try {
      if (token) await authApi.logout();
    } catch {
      // ignored on purpose
    }

    setAuthToken(null);
    setToken(null);
    setUserState(null);
    await clearToken();
  }, [token]);

  // If the server ever rejects our token (expired, revoked, account
  // suspended), drop straight back to the sign-in screen.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthToken(null);
      setToken(null);
      setUserState(null);
      void clearToken();
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  // Restore a saved session on cold start.
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);

        if (saved) {
          setAuthToken(saved);
          const result = await authApi.me();
          setToken(saved);
          setUserState(result.data);
        }
      } catch {
        // Token no longer valid — start clean rather than half-signed-in.
        setAuthToken(null);
        await clearToken();
      } finally {
        setInitialising(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (identifier: string, password: string) => {
    const result = await authApi.login(identifier, password, 'Kavuri Mobile');
    const { token: newToken, user: newUser } = result.data;

    setAuthToken(newToken);
    await saveToken(newToken);
    setToken(newToken);
    setUserState(newUser);
  }, []);

  const signInWithToken = useCallback(async (newToken: string, newUser: User) => {
    setAuthToken(newToken);
    await saveToken(newToken);
    setToken(newToken);
    setUserState(newUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const result = await authApi.me();
    setUserState(result.data);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initialising,
      signIn,
      signInWithToken,
      signOut,
      refreshUser,
      setUser: setUserState,
    }),
    [user, token, initialising, signIn, signInWithToken, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}

/** Roles that are allowed to create listings — mirrors PropertyPolicy::create on the server. */
export const LISTING_ROLES = ['owner', 'landlord', 'builder', 'agent', 'admin'];

export function canCreateListings(user: User | null): boolean {
  return !!user && LISTING_ROLES.includes(user.role);
}

/** Roles that fulfil service requests — mirrors User::PARTNER_ROLES on the server. */
export const PARTNER_ROLES = [
  'interior_designer', 'loan_partner', 'legal_consultant',
  'property_manager', 'rental_manager', 'packers_movers', 'govt_registration_partner',
  'service_provider',
];

export function isPartner(user: User | null): boolean {
  return !!user && PARTNER_ROLES.includes(user.role);
}
