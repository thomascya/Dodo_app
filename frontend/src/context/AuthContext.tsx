import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../config/api';
import type { User } from '../types/database.types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isGuest: false,
  });

  // Restore session on app launch
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          const user = await api.get<User>('/auth/me');
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
            isGuest: false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    })();
  }, []);

  const handleAuthResponse = useCallback(async (data: { access_token: string; refresh_token: string; user: User }, isGuest = false) => {
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.setItem('refresh_token', data.refresh_token);
    setState({
      user: data.user,
      isLoading: false,
      isAuthenticated: true,
      isGuest,
    });
  }, []);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    const data = await api.post<{ access_token: string; refresh_token: string; user: User }>(
      '/auth/signin/social',
      { provider: 'google', id_token: idToken },
    );
    await handleAuthResponse(data);
  }, [handleAuthResponse]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ access_token: string; refresh_token: string; user: User }>(
      '/auth/signin/email',
      { email, password },
    );
    await handleAuthResponse(data);
  }, [handleAuthResponse]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ access_token: string; refresh_token: string; user: User }>(
      '/auth/signup/email',
      { email, password },
    );
    await handleAuthResponse(data);
  }, [handleAuthResponse]);

  const continueAsGuest = useCallback(async () => {
    const data = await api.post<{ access_token: string; refresh_token: string; user: User }>(
      '/auth/guest',
    );
    await handleAuthResponse(data, true);
  }, [handleAuthResponse]);

  const signOut = useCallback(async () => {
    try {
      await api.post('/auth/signout');
    } catch {
      // Best-effort sign out
    }
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    setState({ user: null, isLoading: false, isAuthenticated: false, isGuest: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        continueAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
