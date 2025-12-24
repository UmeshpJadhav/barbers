'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, shopName?: string, phoneNumber?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token is still valid
          authAPI.getCurrentUser()
            .then(({ user }) => {
              setUser(user);
              localStorage.setItem('user', JSON.stringify(user));
            })
            .catch(() => {
              // Token invalid, clear storage
              authAPI.logout();
              setUser(null);
            })
            .finally(() => setLoading(false));
        } catch (error) {
          authAPI.logout();
          setUser(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    setUser(response.user);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    shopName?: string,
    phoneNumber?: string
  ) => {
    const response = await authAPI.register(username, email, password, shopName, phoneNumber);
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    setUser(response.user);
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

