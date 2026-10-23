import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, AuthResponse, User } from '@/services/api';
import { storage } from '@/services/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const savedToken = await storage.getAccessToken();
      const savedUser = await storage.getUser();

      if (savedToken) {
        setToken(savedToken);
        if (savedUser) {
          setUser(savedUser);
        }
        // Verificar token fresco de fondo
        try {
          const freshUser = await api.getProfile();
          setUser(freshUser);
          await storage.saveUser(freshUser);
        } catch {
          // Si el token expiró, cerrar sesión
          await logout();
        }
      }
    } catch (e) {
      console.error('Error restaurando sesión', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const response: AuthResponse = await api.login(email.trim(), password);
      
      setToken(response.access);
      setUser(response.user);

      await storage.saveTokens(response.access, response.refresh);
      await storage.saveUser(response.user);

      return true;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setError(null);
    await storage.clearAuth();
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticating,
        error,
        login,
        logout,
        clearError,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

