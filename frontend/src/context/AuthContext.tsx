import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/axios";
import { ApiResponse, AuthData, LoginPayload, Role, User } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  demoLogin: (role: Role) => Promise<User>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("sms_auth_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const currentToken = localStorage.getItem("sms_auth_token");
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<User>>("/auth/me");
      setUser(response.data.data);
    } catch {
      localStorage.removeItem("sms_auth_token");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      queryClient.clear();
      setUser(null);
      setToken(null);
      toast.error("Your session has expired. Please sign in again.");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [queryClient]);

  const login = async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<AuthData>>("/auth/login", payload);
      const authData = response.data.data;
      queryClient.clear();
      localStorage.setItem("sms_auth_token", authData.token);
      setToken(authData.token);
      setUser(authData.user);
      toast.success(`Welcome back, ${authData.user.name}`);
      return authData.user;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (targetRole: Role): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<AuthData>>(`/auth/demo/${targetRole}`);
      const authData = response.data.data;
      queryClient.clear();
      localStorage.setItem("sms_auth_token", authData.token);
      setToken(authData.token);
      setUser(authData.user);
      toast.success(`Logged in as Demo ${authData.user.role.toUpperCase()}`);
      return authData.user;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Demo login failed";
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem("sms_auth_token");
      queryClient.clear();
      setUser(null);
      setToken(null);
      toast.info("You have been logged out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        token,
        isLoading,
        login,
        demoLogin,
        logout,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
