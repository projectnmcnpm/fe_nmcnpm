"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  Settings,
  LogOut,
  Film,
  Menu,
  Bell,
  Brush,
  ChevronRight,
  X,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function DashboardLayout({
  children,
  allowedRoles,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simple role check (in a real app, this would redirect)
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">
        <div className="text-center">
          <h1 className="text-4xl mb-4 text-accent-primary">
            Truy cập bị từ chối
          </h1>
          <p className="text-text-secondary mb-6">
            Bạn không có quyền truy cập trang này.
          </p>
          <Link href="/" className="btn-primary">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const getMenuItems = () => {
    switch (user.role) {
      case "manager":
        return [
          {
            icon: LayoutDashboard,
            label: "Dashboard",
            path: "/admin/dashboard",
          },
          { icon: BedDouble, label: "Quản lý phòng", path: "/admin/rooms" },
          { icon: CalendarCheck, label: "Đặt phòng", path: "/admin/bookings" },
          { icon: Users, label: "Khách hàng", path: "/admin/customers" },
          { icon: Settings, label: "Tài khoản", path: "/admin/accounts" },
        ];
      case "receptionist":
        return [
          {
            icon: LayoutDashboard,
            label: "Dashboard",
            path: "/staff/dashboard",
          },
          { icon: CalendarCheck, label: "Đặt phòng", path: "/staff/bookings" },
          { icon: BedDouble, label: "Trạng thái phòng", path: "/staff/rooms" },
          { icon: Users, label: "Khách hàng", path: "/staff/customers" },
        ];
      case "cleaner":
        return [
          { icon: Brush, label: "Phòng cần dọn", path: "/cleaner/dashboard" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const mobileActiveItem =
    menuItems.find((item) => pathname === item.path) ?? menuItems[0];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-primary">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex bg-bg-secondary border-r border-border-subtle transition-all duration-300 flex-col ${isSidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="h-20 flex items-center justify-center border-b border-border-subtle px-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-accent-primary overflow-hidden whitespace-nowrap"
          >
            <Film size={32} className="shrink-0" />
            {isSidebarOpen && (
              <span className="font-display text-2xl tracking-wider text-text-primary mt-1">
                GENZ CINEMA
              </span>
            )}
          </Link>
        </div>

        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-accent-primary text-white border-l-2 border-accent-primary"
                    : "text-text-secondary hover:bg-accent-primary hover:text-white"
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <item.icon size={20} className="shrink-0" />
                {isSidebarOpen && (
                  <span className="font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border-subtle">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 transition-all"
            title={!isSidebarOpen ? "Đăng xuất" : undefined}
          >
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-20 md:pb-0">
        {/* Topbar */}
        <header className="h-16 md:h-20 bg-bg-secondary/70 backdrop-blur-sm border-b border-border-subtle flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileMenuOpen(true);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Mở menu"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block text-sm text-text-muted">
              <span className="text-accent-neon font-mono">
                [{user.role.toUpperCase()}]
              </span>{" "}
              Dashboard
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-text-secondary hover:text-text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-primary rounded-full border-2 border-bg-secondary"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-border-subtle">
              <div className="w-8 h-8 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center font-bold border border-accent-primary/30">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-text-primary">
                  {user.name}
                </div>
                <div className="text-xs text-text-muted">{user.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-subtle px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`min-w-[84px] min-h-14 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-colors shrink-0 ${isActive ? "bg-accent-primary text-white border-accent-primary" : "bg-bg-primary text-text-muted border-border-subtle"}`}
              >
                <item.icon size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-center px-1">
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="min-w-[84px] min-h-14 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 border border-border-subtle bg-bg-primary text-text-muted shrink-0"
          >
            <LogOut size={18} />
            <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
              Thoát
            </span>
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[40] bg-black/60 backdrop-blur-sm">
          <button
            className="absolute inset-0"
            aria-label="Đóng menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[82vw] max-w-sm bg-bg-primary border-r border-border-subtle shadow-2xl flex flex-col">
            <div className="h-16 px-4 flex items-center justify-between border-b border-border-subtle">
              <div className="flex items-center gap-3 text-accent-primary">
                <Film size={26} />
                <span className="font-display text-2xl tracking-wider text-text-primary">
                  GENZ CINEMA
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-xl bg-bg-secondary border border-border-subtle flex items-center justify-center text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-4 font-bold transition-colors ${isActive ? "bg-accent-primary text-white border-accent-primary" : "bg-bg-secondary text-text-primary border-border-subtle"}`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight size={18} />
                  </Link>
                );
              })}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-secondary px-4 py-4 font-bold text-text-primary"
              >
                <span className="flex items-center gap-3">
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </span>
              </button>
            </div>

            {mobileActiveItem && (
              <div className="p-4 border-t border-border-subtle bg-bg-secondary/60">
                <div className="rounded-2xl border border-accent-primary/20 bg-accent-primary/8 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted font-bold mb-1">
                    Đang ở
                  </p>
                  <p className="text-text-primary font-bold">
                    {mobileActiveItem.label}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
