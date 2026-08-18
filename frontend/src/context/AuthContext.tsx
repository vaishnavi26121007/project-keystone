import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../api/axios';
import { AuthUser, Role } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  clientId?: number;
  specialization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'keystone_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthUser>('/auth/login', { email, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    setUser(res.data);
  };

  const register = async (payload: RegisterPayload) => {
    const res = await api.post<AuthUser>('/auth/register', payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
