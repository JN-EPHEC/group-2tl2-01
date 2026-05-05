import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { login as apiLogin, getMe, changePassword as apiChangePassword, logout as apiLogout } from '../api/auth';
import type { LoginCredentials, ChangePasswordPayload } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    const { token, user: u } = await apiLogin(credentials);
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
    }
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    await apiChangePassword(payload);
    const updated = await getMe();
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};