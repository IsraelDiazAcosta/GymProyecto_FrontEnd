import {
  api,
  ApiError,
  AuthResponse,
  ProfileUpdatePayload,
  RegisterPayload,
  User,
} from "@/services/api";
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
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<User>;
  refreshProfile: () => Promise<User | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function extractApiError(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.data && typeof err.data === "object") {
    const data = err.data as Record<string, unknown>;
    const priorityKeys = [
      "email",
      "username",
      "password",
      "password_confirm",
      "non_field_errors",
      "detail",
    ];
    for (const key of priorityKeys) {
      const val = data[key];
      if (Array.isArray(val) && val.length > 0) return String(val[0]);
      if (typeof val === "string" && val.trim()) return val;
    }
    for (const val of Object.values(data)) {
      if (Array.isArray(val) && val.length > 0) return String(val[0]);
      if (typeof val === "string" && val.trim()) return val;
    }
  }
  return (err as any)?.message || fallback;
}

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

      await storage.saveTokens(response.access, response.refresh);
      await storage.saveUser(response.user);

      setToken(response.access);
      setUser(response.user);

      return true;
    } catch (err: any) {
      setError(err.message || "Sign-in error");
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const response = await api.register({
        email: payload.email.trim().toLowerCase(),
        username: payload.username?.trim() || undefined,
        password: payload.password,
        password_confirm: payload.password_confirm,
      });

      const access = response.tokens?.access;
      const refresh = response.tokens?.refresh;
      if (!access || !refresh || !response.user) {
        throw new Error("Incomplete registration response.");
      }

      await storage.saveTokens(access, refresh);
      await storage.saveUser(response.user);
      setToken(access);
      setUser(response.user);
      return true;
    } catch (err) {
      setError(extractApiError(err, "Could not create account"));
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

  const refreshProfile = async (): Promise<User | null> => {
    try {
      const freshUser = await api.getProfile();
      setUser(freshUser);
      await storage.saveUser(freshUser);
      return freshUser;
    } catch {
      return null;
    }
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
        register,
        logout,
        updateProfile,
        refreshProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
