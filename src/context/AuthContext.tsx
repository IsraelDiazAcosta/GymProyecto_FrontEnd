import { api, AuthResponse, ProfileUpdatePayload, User } from "@/services/api";
import { storage } from "@/services/storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;
  login: (
    emailOrObj: string | { username: string; password: string },
    password?: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<User>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
        try {
          const freshUser = await api.getProfile();
          setUser(freshUser);
          await storage.saveUser(freshUser);
        } catch {
          await logout();
        }
      }
    } catch (e) {
      console.error("Error restoring session", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    emailOrObj: string | { username: string; password: string },
    passwordArg?: string,
  ): Promise<boolean> => {
    const email =
      typeof emailOrObj === "string" ? emailOrObj : emailOrObj.username;
    const password =
      typeof emailOrObj === "string" ? passwordArg || "" : emailOrObj.password;

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
      setError(err.message || "Error al iniciar sesión");
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

  const updateProfile = async (payload: ProfileUpdatePayload) => {
    const updated = await api.updateProfile(payload);
    setUser(updated);
    await storage.saveUser(updated);
    return updated;
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isInitializing: isLoading,
        isAuthenticated: Boolean(user || token),
        isAuthenticating,
        error,
        login,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
