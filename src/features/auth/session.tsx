import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  clearSession as clearStoredSession,
  loadSession,
  saveSession,
} from '@/features/auth/token-storage';
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RegisterCoachCredentials,
  RegisterStudentCredentials,
} from '@/features/auth/types';
import {
  loginApi,
  registerCoachApi,
  registerStudentApi,
} from '@/services/api/auth.api';
import { setAuthToken, setUnauthorizedHandler } from '@/services/api/client';

type AuthContextValue = {
  session: AuthSession | null;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  registerStudent: (credentials: RegisterStudentCredentials) => Promise<AuthSession>;
  registerCoach: (credentials: RegisterCoachCredentials) => Promise<AuthSession>;
  updateUser: (patch: Partial<Pick<AuthUser, 'name' | 'email'>>) => Promise<void>;
  logout: () => Promise<void>;
  refreshFromStorage: () => Promise<AuthSession | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toSession(result: LoginResponse): AuthSession {
  return {
    token: result.token,
    user: {
      id: String(result.user.id),
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback((next: AuthSession | null) => {
    setAuthToken(next?.token ?? null);
    setSession(next);
  }, []);

  const refreshFromStorage = useCallback(async () => {
    const stored = await loadSession();
    applySession(stored);
    return stored;
  }, [applySession]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await loadSession();
        if (active) applySession(stored);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [applySession]);

  const establishSession = useCallback(
    async (result: LoginResponse) => {
      const nextSession = toSession(result);
      await saveSession(nextSession);
      applySession(nextSession);
      return nextSession;
    },
    [applySession],
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const result = await loginApi(credentials);
      return establishSession(result);
    },
    [establishSession],
  );

  const registerStudent = useCallback(
    async (credentials: RegisterStudentCredentials) => {
      const result = await registerStudentApi(credentials);
      return establishSession(result);
    },
    [establishSession],
  );

  const registerCoach = useCallback(
    async (credentials: RegisterCoachCredentials) => {
      const result = await registerCoachApi(credentials);
      return establishSession(result);
    },
    [establishSession],
  );

  const updateUser = useCallback(
    async (patch: Partial<Pick<AuthUser, 'name' | 'email'>>) => {
      if (!session) return;
      const next: AuthSession = {
        ...session,
        user: {
          ...session.user,
          ...patch,
          name: patch.name?.trim() || session.user.name,
          email: patch.email?.trim() || session.user.email,
        },
      };
      await saveSession(next);
      applySession(next);
    },
    [applySession, session],
  );

  const logout = useCallback(async () => {
    applySession(null);
    await clearStoredSession();
  }, [applySession]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoading,
      isAuthenticated: Boolean(session?.token),
      login,
      registerStudent,
      registerCoach,
      updateUser,
      logout,
      refreshFromStorage,
    }),
    [
      session,
      isLoading,
      login,
      registerStudent,
      registerCoach,
      updateUser,
      logout,
      refreshFromStorage,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function getHomeHrefForRole(role: AuthUser['role']): '/dashboard' | '/coach/dashboard' | null {
  if (role === 'Student') return '/dashboard';
  if (role === 'Coach') return '/coach/dashboard';
  return null;
}
