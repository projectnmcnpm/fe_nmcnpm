"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Film, User, LogOut, Menu, X, ChevronRight } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const navItems = [
    { href: "/", label: "TRANG CHỦ" },
    { href: "/rooms", label: "PHÒNG" },
    ...(user ? [{ href: "/history", label: "LỊCH SỬ PHÒNG" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-accent-primary group-hover:scale-110 transition-transform">
              <Film size={32} />
            </div>
            <span className="font-display text-3xl tracking-wider text-text-primary">
              GENZ CINEMA
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-text-secondary hover:text-accent-neon transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <User size={18} className="text-accent-neon" />
                  <span>
                    Xin chào,{" "}
                    <strong className="text-text-primary">{user.name}</strong>
                  </span>
                </div>
                {user.role !== "customer" && (
                  <Link
                    href={`/${user.role === "manager" ? "admin" : user.role === "receptionist" ? "staff" : "cleaner"}/dashboard`}
                    className="text-xs bg-bg-secondary border border-border-subtle px-3 py-1.5 rounded hover:border-accent-neon transition-colors"
                  >
                    Vào Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-text-muted hover:text-accent-primary transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-text-primary font-medium hover:text-accent-neon transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/login?register=true"
                  className="btn-primary py-2 px-4 text-sm"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-text-secondary hover:text-text-primary"
              aria-label="Mở menu"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm">
          <button
            className="absolute inset-0"
            aria-label="Đóng menu"
            onClick={closeMenu}
          />
          <div className="absolute right-0 top-0 h-full w-[85vw] max-w-sm bg-bg-primary border-l border-border-subtle shadow-2xl flex flex-col">
            <div className="h-20 px-4 flex items-center justify-between border-b border-border-subtle">
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-3 text-accent-primary"
              >
                <Film size={28} />
                <span className="font-display text-2xl tracking-wider text-text-primary">
                  GENZ CINEMA
                </span>
              </Link>
              <button
                onClick={closeMenu}
                className="w-10 h-10 rounded-xl bg-bg-secondary border border-border-subtle flex items-center justify-center text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-secondary px-4 py-4 text-text-primary font-bold"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={18} className="text-text-muted" />
                  </Link>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {user ? (
                  <>
                    {user.role !== "customer" && (
                      <Link
                        href={`/${user.role === "manager" ? "admin" : user.role === "receptionist" ? "staff" : "cleaner"}/dashboard`}
                        onClick={closeMenu}
                        className="flex items-center justify-between rounded-2xl border border-accent-primary/20 bg-accent-primary/8 px-4 py-4 text-accent-primary font-bold"
                      >
                        <span>Vào Dashboard</span>
                        <ChevronRight size={18} />
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        closeMenu();
                        logout();
                      }}
                      className="w-full flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-secondary px-4 py-4 text-text-primary font-bold"
                    >
                      <span>Đăng xuất</span>
                      <LogOut size={18} className="text-accent-primary" />
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="btn-outline text-center"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/login?register=true"
                      onClick={closeMenu}
                      className="btn-primary text-center"
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
