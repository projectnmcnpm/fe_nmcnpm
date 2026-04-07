"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Role = "customer" | "receptionist" | "cleaner" | "manager";

export interface User {
  email: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: Role, name: string, password?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export let TEST_ACCOUNTS = [
  {
    email: "khachhang@genz.com",
    password: "password123",
    role: "customer" as Role,
    name: "Khách Hàng",
    redirect: "/",
  },
  {
    email: "letan@genz.com",
    password: "password123",
    role: "receptionist" as Role,
    name: "Lễ Tân",
    redirect: "/staff/dashboard",
  },
  {
    email: "dondep@genz.com",
    password: "password123",
    role: "cleaner" as Role,
    name: "Nhân Viên Dọn Dẹp",
    redirect: "/cleaner/dashboard",
  },
  {
    email: "quanly@genz.com",
    password: "password123",
    role: "manager" as Role,
    name: "Quản Lý",
    redirect: "/admin/dashboard",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("genz_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsAuthReady(true);
  }, []);

  // Route protection logic
  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const isPublicRoute =
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/history" ||
      pathname.startsWith("/rooms");

    if (!user && !isPublicRoute) {
      router.push("/login");
      return;
    }

    if (!user) {
      return;
    }

    const roleRouteMap: Record<Role, string> = {
      customer: "/",
      receptionist: "/staff/dashboard",
      cleaner: "/cleaner/dashboard",
      manager: "/admin/dashboard",
    };

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

  const login = (
    email: string,
    role: Role,
    name: string,
    password?: string,
  ) => {
    const newUser = { email, role, name };
    setUser(newUser);
    localStorage.setItem("genz_user", JSON.stringify(newUser));

    // Add to TEST_ACCOUNTS if it's a new registration
    if (password && !TEST_ACCOUNTS.find((acc) => acc.email === email)) {
      TEST_ACCOUNTS.push({ email, password, role, name, redirect: "/" });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("genz_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
