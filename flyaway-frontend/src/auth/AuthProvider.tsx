import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import client, { setAuthToken } from "../api/client";

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  token: string | null;
  me: User | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [me, setMe] = useState<User | null>(null);

  useEffect(() => {
    setAuthToken(token ?? undefined);

    if (!token) {
      setMe(null);
      return;
    }

    async function loadMe() {
      try {
        const res = await client.get("/users/me");
        setMe(res.data);
      } catch {
        logout();
      }
    }

    loadMe();
  }, [token]);

  const login = (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setMe(null);
  };

  return (
    <AuthContext.Provider value={{ token, me, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
