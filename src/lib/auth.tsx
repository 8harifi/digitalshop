"use client";

import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api, { API_URL, tokenStore } from "./api";

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
};

type AuthContextValue = {
  user: AdminUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AdminUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (!tokenStore.access) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/me/");
        if (active) setUser(data);
      } catch {
        tokenStore.clear();
      } finally {
        if (active) setLoading(false);
      }
    };
    bootstrap();

    const onUnauthorized = () => setUser(null);
    window.addEventListener("kh-unauthorized", onUnauthorized);
    return () => {
      active = false;
      window.removeEventListener("kh-unauthorized", onUnauthorized);
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await axios.post(`${API_URL}/token/`, {
      username,
      password,
    });
    tokenStore.set(data.access, data.refresh);
    const me = await api.get("/me/");
    setUser(me.data);
    return me.data as AdminUser;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
