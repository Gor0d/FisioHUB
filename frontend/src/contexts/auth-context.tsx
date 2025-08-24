'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
// import { User, LoginInput, RegisterInput } from '@fisiohub/shared';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se estamos no cliente (browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fisiohub-token');
      const savedUser = localStorage.getItem('fisiohub-user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('fisiohub-token');
          localStorage.removeItem('fisiohub-user');
        }
      }
    }

    setLoading(false);
  }, []);

  const login = async (data: LoginInput) => {
    try {
      const response = await authApi.login(data);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('fisiohub-token', token);
          localStorage.setItem('fisiohub-user', JSON.stringify(userData));
        }
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      const response = await authApi.register(data);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('fisiohub-token', token);
          localStorage.setItem('fisiohub-user', JSON.stringify(userData));
        }
        setUser(userData);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fisiohub-token');
      localStorage.removeItem('fisiohub-user');
      // Redirecionar para a página de login
      window.location.href = '/login';
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user 
    }}>
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