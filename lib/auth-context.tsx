"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  apiClient,
  clearStoredAuth,
  getStoredAuth,
  type AuthUser,
} from "@/lib/api-client";

export type Role = AuthUser["role"];

export type User = AuthUser;

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedSession = getStoredAuth();

      if (!storedSession) {
        setIsAuthReady(true);
        return;
      }

      try {
        if (storedSession.expiresAt <= Date.now()) {
          const refreshed = await apiClient.refreshSession();
          setUser(refreshed?.user ?? null);
          return;
        }

        setUser(storedSession.user);
      } finally {
        setIsAuthReady(true);
      }
    };

    void bootstrapAuth();
  }, []);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const isPublicRoute =
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/history" ||
      pathname.startsWith("/rooms");

    const roleRouteMap: Record<Role, string> = {
      customer: "/",
      receptionist: "/staff/dashboard",
      cleaner: "/cleaner/dashboard",
      manager: "/admin/dashboard",
    };

    if (!user && !isPublicRoute) {
      router.push("/login");
      return;
    }

    if (user && pathname === "/login") {
      router.push(roleRouteMap[user.role]);
      return;
    }

    if (!user) {
      return;
    }

    if (pathname.startsWith("/admin") && user.role !== "manager") {
      router.push(roleRouteMap[user.role]);
      return;
    }

    if (
      pathname.startsWith("/staff") &&
      user.role !== "receptionist" &&
      user.role !== "manager"
    ) {
      router.push(roleRouteMap[user.role]);
      return;
    }

    if (
      pathname.startsWith("/cleaner") &&
      user.role !== "cleaner" &&
      user.role !== "manager"
    ) {
      router.push(roleRouteMap[user.role]);
    }
  }, [user, pathname, router, isAuthReady]);

  const login = async (email: string, password: string) => {
    const session = await apiClient.login(email, password);
    setUser(session.user);
    return session.user;
  };

  const register = async (name: string, email: string, password: string) => {
    const session = await apiClient.register(name, email, password);
    setUser(session.user);
    return session.user;
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } finally {
      clearStoredAuth();
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
